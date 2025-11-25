import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - expiresIn acepta string pero el tipo espera StringValue
  return jwt.sign(
    { id: userId, email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

