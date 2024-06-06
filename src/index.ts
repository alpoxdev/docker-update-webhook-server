import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { exec } from 'node:child_process';

config();

const app = new Hono();

const dockerUpdateScript = `
  docker login ghcr.io -u USERNAME -p ${process.env.GITHUB_TOKEN} && \
  if [ $(docker ps -a -q -f name=${process.env.DOCKER_CONTAINER_NAME}) ]; then \
    docker stop ${process.env.DOCKER_CONTAINER_NAME} && docker rm ${process.env.DOCKER_CONTAINER_NAME}; \
  fi && \
  if [ $(docker images -q ${process.env.DOCKER_IMAGE_URL}) ]; then \
    docker rmi ${process.env.DOCKER_IMAGE_URL}; \
  fi && \
  docker pull ${process.env.DOCKER_IMAGE_URL} && \
  docker run -d --name ${process.env.DOCKER_CONTAINER_NAME} -p ${process.env.DOCKER_IMAGE_PORT}:${process.env.DOCKER_IMAGE_PORT} ${process.env.DOCKER_IMAGE_URL}
`;

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
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
