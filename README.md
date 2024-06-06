```shell
docker run \
-d \
--name=webhook-server \
-p 5000:5000 \
-v /var/run/docker.sock:/var/run/docker.sock \
-e DOCKER_IMAGE_URL='target_image_url' \
-e DOCKER_IMAGE_PORT='3000' \
-e DOCKER_CONTAINER_NAME='target_container' \
-e GITHUB_TOKEN='github_token' \
ghcr.io/alpoxdev/docker-update-webhook-server:latest
```

```shell
curl -X POST http://localhost:5000/webhook
```
