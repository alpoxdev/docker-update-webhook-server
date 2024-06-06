import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { exec } from 'node:child_process';

const DOCKER_IMAGE_URL = process.env.DOCKER_IMAGE_URL;
const DOCKER_IMAGE_PORT = process.env.DOCKER_IMAGE_PORT || 3000;
const DOCKER_CONTAINER_NAME = process.env.DOCKER_CONTAINER_NAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!DOCKER_IMAGE_URL || !DOCKER_CONTAINER_NAME) {
  console.error('Error: DOCKER_IMAGE_URL and DOCKER_CONTAINER_NAME must be set.');
  process.exit(1);
}

const dockerUpdateScript = `
  docker login ghcr.io -u USERNAME -p ${GITHUB_TOKEN} && \
  if [ \$(docker ps -a -q -f name=${DOCKER_CONTAINER_NAME}) ]; then \
    docker stop ${DOCKER_CONTAINER_NAME} && docker rm ${DOCKER_CONTAINER_NAME}; \
  fi && \
  if [ \$(docker images -q ${DOCKER_IMAGE_URL}) ]; then \
    docker rmi ${DOCKER_IMAGE_URL}; \
  fi && \
  docker pull ${DOCKER_IMAGE_URL} && \
  docker run -d --name ${DOCKER_CONTAINER_NAME} -p ${DOCKER_IMAGE_PORT}:${DOCKER_IMAGE_PORT} ${DOCKER_IMAGE_URL}
`;

const app = new Hono();

app.post('/webhook', async (c) => {
  const payload = await c.req.json();

  exec(dockerUpdateScript, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return c.json({ message: 'Error updating Docker image' }, 500);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    return c.json({ message: 'Docker image updated and container restarted' }, 200);
  });
});

const port = 5000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on port ${port}`);
