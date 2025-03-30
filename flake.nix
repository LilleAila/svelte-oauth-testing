{
  description = "Development environments for various languages";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }@inputs:
    let
      lib = nixpkgs.lib;
      systems = lib.systems.flakeExposed;
      pkgsFor = lib.genAttrs systems (system: import nixpkgs { inherit system; });
      forEachSystem = f: lib.genAttrs systems (system: f pkgsFor.${system});
    in
    {
      devShells = forEachSystem (
        pkgs: with pkgs; {
          default = mkShell {
            nativeBuildInputs = [
              nixd
              nixfmt-rfc-style
              statix

              nodejs_20
              nodePackages.npm
              nodePackages.typescript-language-server
              nodePackages.typescript
              emmet-ls
              vscode-langservers-extracted
              prettierd

              pocketbase
            ];
          };
        }
      );
    };
}
