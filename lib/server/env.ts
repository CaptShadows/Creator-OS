import "server-only";

type ServerEnvironment = {
  nodeEnv: "development" | "production" | "test";
};

export function getServerEnvironment(): ServerEnvironment {
  const nodeEnv = process.env.NODE_ENV ?? "development";

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Unsupported NODE_ENV: ${nodeEnv}`);
  }

  return { nodeEnv: nodeEnv as ServerEnvironment["nodeEnv"] };
}
