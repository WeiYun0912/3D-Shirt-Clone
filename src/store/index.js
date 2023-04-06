import { proxy } from "valtio";

const state = proxy({
  intro: true,
  color: "#E8A0BF",
  isLogoTexture: true,
  isFullTexture: false,
  logoDecal: "./courage.png",
  fullDecal: "./courage.png",
});

export default state;
