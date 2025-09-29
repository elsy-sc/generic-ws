import * as bcrypt from 'bcrypt';
import { DEFAULT_BCRYPT_SALT_ROUNDS } from './constante.util';

export class HashUtil {
  static async hash(text: string): Promise<string> {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || DEFAULT_BCRYPT_SALT_ROUNDS;
    return bcrypt.hash(text, saltRounds);
  }

  static async verify(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash);
  }
}