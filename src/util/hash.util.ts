import * as bcrypt from 'bcrypt';

export class HashUtil {
  static async hash(text: string): Promise<string> {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    return bcrypt.hash(text, saltRounds);
  }

  static async verify(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }
}