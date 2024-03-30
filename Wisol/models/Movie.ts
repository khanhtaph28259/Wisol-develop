import * as borsh from "@project-serum/borsh";

export class Wifi {
  namewifi: string;
  password: number;
  address: string;
  sol: number;

  constructor(namewifi: string, password: number, address: string, sol: number) {
    this.namewifi = namewifi;
    this.password = password;
    this.address = address;
    this.sol = sol;
  }

  static borshSchema = borsh.struct([
    borsh.str("namewifi"),
    borsh.u32("password"), // Assuming the password is an integer and fits in a u32
    borsh.str("address"),
    borsh.u32("sol"), // Assuming sol is an integer and fits in a u32
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000); // Consider estimating a more accurate size or dynamic resizing for efficiency
    Wifi.borshSchema.encode(this, buffer);
    return buffer.slice(0, Wifi.borshSchema.getSpan(buffer));
  }

  static deserialize(buffer: Buffer): Wifi | null {
    try {
      const { namewifi, password, address, sol } = Wifi.borshSchema.decode(buffer);
      return new Wifi(namewifi, password, address, sol);
    } catch (error) {
      console.log("Deserialization error:", error);
      return null;
    }
  }
}
