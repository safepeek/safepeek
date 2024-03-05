export function generateULID(): string {
  const timestamp = new Date().getTime();
  const randomPart = crypto.getRandomValues(new Uint8Array(10));
  return encodeTime(timestamp, 10) + encodeRandom(randomPart, 16);
}

function encodeTime(time: number, len: number): string {
  let mod: number,
    str: string = '';
  for (; len > 0; len--) {
    mod = time % 32;
    str = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.charAt(mod) + str;
    time = (time - mod) / 32;
  }
  return str;
}

function encodeRandom(random: Uint8Array, len: number): string {
  let str: string = '';
  for (let i = 0; i < len; i++) {
    const value = random[i % random.length];
    str += '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.charAt(value % 32);
  }
  return str;
}
