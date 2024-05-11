{
  description = "Flake for Blizzbot(JS)";

  inputs = {
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      perSystem =
        { pkgs, ... }:
        {
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              biome.enable = true;
              nixfmt-rfc-style.enable = true;
              deadnix.enable = true;
              statix.enable = true;
            };
          };
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              biome
              bun
              typescript
            ];
          };

          packages.default = pkgs.hello;
        };
      flake = { };
    };
}
