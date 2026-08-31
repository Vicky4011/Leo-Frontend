export {};

declare global {
  interface Window {
    leoFileSystem?: {
      chooseFolder: () => Promise<
        string | null
      >;

      readDirectory: (
        directoryPath: string
      ) => Promise<LocalFile[]>;

      readFile: (
        filePath: string
      ) => Promise<LocalFileContent>;
    };
  }

  type LocalFile = {
    name: string;
    path: string;
    type: "file" | "directory";
    size: number;
    modified: number;
    extension: string;
  };

  type LocalFileContent =
    | {
        type: "text";
        name: string;
        path: string;
        content: string;
        size: number;
      }
    | {
        type: "binary";
        name: string;
        path: string;
        size: number;
      };
}