import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      department?: string;
      canUploadDocs: boolean;
    };
  }

  interface User {
    role: string;
    department?: string;
    canUploadDocs: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    department?: string;
    canUploadDocs: boolean;
  }
}
