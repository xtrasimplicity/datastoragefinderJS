IMAGE_NAME := xtrasimplicity/data-storage-finder
VERSION := latest

PLATFORMS := linux/arm64,linux/amd64

all: create-builder compile-app build-and-push

compile-app:
	rm -rf out && \
	rm -rf docker-build/out && \
	npm run build && \
	mv out docker-build/

build-and-push:
	docker buildx build \
		--platform=$(PLATFORMS) \
		-t $(IMAGE_NAME):$(VERSION) \
		--push docker-build

create-builder:
	docker buildx create --name multiarch-builder --use --bootstrap || true

inspect-builder:
	docker buildx inspect --bootstrap

clean-builder:
	docker buildx rm multiarch-builder || true

.PHONY: all build create-builder inspect-builder clean-builder