export type FSType =
  | {
      name: string;
      directory: false;
    }
  | {
      name: string;
      directory: true;
      files: {
        name: string;
        directory: false;
      }[];
    };
