#!/bin/bash

# Docker Swarm Deployment Script
# This script helps deploy the application to Docker Swarm

set -e

STACK_NAME="${STACK_NAME:-rest-api}"
IMAGE_NAME="${IMAGE_NAME:-rest-api:latest}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-stack.yml}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker Swarm is initialized
check_swarm() {
    if ! docker info | grep -q "Swarm: active"; then
        echo_error "Docker Swarm is not initialized"
        echo_info "Initializing Docker Swarm..."
        docker swarm init
    else
        echo_info "Docker Swarm is already initialized"
    fi
}

# Create secrets
create_secrets() {
    echo_info "Creating Docker Swarm secrets..."
    
    # Check if secrets already exist
    if docker secret ls | grep -q "database_url"; then
        echo_warn "Secret 'database_url' already exists. Skipping..."
    else
        if [ -z "$DATABASE_URL" ]; then
            read -sp "Enter DATABASE_URL: " DATABASE_URL
            echo
        fi
        echo "$DATABASE_URL" | docker secret create database_url -
        echo_info "Created secret: database_url"
    fi
    
    if docker secret ls | grep -q "jwt_secret"; then
        echo_warn "Secret 'jwt_secret' already exists. Skipping..."
    else
        if [ -z "$JWT_SECRET" ]; then
            read -sp "Enter JWT_SECRET: " JWT_SECRET
            echo
        fi
        echo "$JWT_SECRET" | docker secret create jwt_secret -
        echo_info "Created secret: jwt_secret"
    fi
    
    if docker secret ls | grep -q "postgres_password"; then
        echo_warn "Secret 'postgres_password' already exists. Skipping..."
    else
        if [ -z "$POSTGRES_PASSWORD" ]; then
            read -sp "Enter POSTGRES_PASSWORD: " POSTGRES_PASSWORD
            echo
        fi
        echo "$POSTGRES_PASSWORD" | docker secret create postgres_password -
        echo_info "Created secret: postgres_password"
    fi
}

# Build and push image
build_image() {
    echo_info "Building Docker image: $IMAGE_NAME"
    docker build -t $IMAGE_NAME .
    
    # If registry is specified, tag and push
    if [ -n "$REGISTRY" ]; then
        REGISTRY_IMAGE="$REGISTRY/$IMAGE_NAME"
        echo_info "Tagging image for registry: $REGISTRY_IMAGE"
        docker tag $IMAGE_NAME $REGISTRY_IMAGE
        echo_info "Pushing image to registry..."
        docker push $REGISTRY_IMAGE
        IMAGE_NAME=$REGISTRY_IMAGE
    fi
}

# Deploy stack
deploy_stack() {
    echo_info "Deploying stack: $STACK_NAME"
    
    # Update image name in compose file if registry is used
    if [ -n "$REGISTRY" ]; then
        sed "s|image: rest-api:latest|image: $REGISTRY/$IMAGE_NAME|g" $COMPOSE_FILE > /tmp/docker-stack-tmp.yml
        COMPOSE_FILE=/tmp/docker-stack-tmp.yml
    fi
    
    docker stack deploy -c $COMPOSE_FILE $STACK_NAME
    
    echo_info "Waiting for services to be ready..."
    sleep 10
    
    echo_info "Stack deployed successfully!"
    echo_info "View stack status: docker stack ps $STACK_NAME"
    echo_info "View services: docker stack services $STACK_NAME"
}

# Remove stack
remove_stack() {
    echo_warn "Removing stack: $STACK_NAME"
    docker stack rm $STACK_NAME
    echo_info "Stack removed. Waiting for cleanup..."
    sleep 5
}

# Scale service
scale_service() {
    SERVICE_NAME=$1
    REPLICAS=$2
    
    if [ -z "$SERVICE_NAME" ] || [ -z "$REPLICAS" ]; then
        echo_error "Usage: scale_service <service_name> <replicas>"
        exit 1
    fi
    
    echo_info "Scaling $SERVICE_NAME to $REPLICAS replicas"
    docker service scale ${STACK_NAME}_${SERVICE_NAME}=$REPLICAS
}

# Show status
show_status() {
    echo_info "Stack Status:"
    docker stack ps $STACK_NAME
    
    echo_info "\nServices:"
    docker stack services $STACK_NAME
    
    echo_info "\nSecrets:"
    docker secret ls
    
    echo_info "\nNetworks:"
    docker network ls | grep $STACK_NAME
}

# Main execution
main() {
    case "${1:-deploy}" in
        init)
            check_swarm
            create_secrets
            ;;
        build)
            build_image
            ;;
        deploy)
            check_swarm
            create_secrets
            build_image
            deploy_stack
            show_status
            ;;
        remove|rm)
            remove_stack
            ;;
        scale)
            scale_service $2 $3
            ;;
        status)
            show_status
            ;;
        logs)
            SERVICE_NAME=${2:-app}
            docker service logs -f ${STACK_NAME}_${SERVICE_NAME}
            ;;
        update)
            check_swarm
            build_image
            deploy_stack
            show_status
            ;;
        *)
            echo "Usage: $0 {init|build|deploy|remove|scale|status|logs|update}"
            echo ""
            echo "Commands:"
            echo "  init     - Initialize Swarm and create secrets"
            echo "  build    - Build Docker image"
            echo "  deploy   - Full deployment (init + build + deploy)"
            echo "  remove   - Remove the stack"
            echo "  scale    - Scale a service (requires service name and replicas)"
            echo "  status   - Show stack status"
            echo "  logs     - Follow logs for a service"
            echo "  update   - Rebuild and update the stack"
            echo ""
            echo "Environment variables:"
            echo "  STACK_NAME          - Stack name (default: rest-api)"
            echo "  IMAGE_NAME          - Image name (default: rest-api:latest)"
            echo "  COMPOSE_FILE        - Compose file (default: docker-stack.yml)"
            echo "  REGISTRY            - Docker registry URL (optional)"
            echo "  DATABASE_URL        - Database connection string"
            echo "  JWT_SECRET          - JWT secret key"
            echo "  POSTGRES_PASSWORD   - PostgreSQL password"
            exit 1
            ;;
    esac
}

main "$@"
