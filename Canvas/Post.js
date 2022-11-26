import { Canvas } from "canvas";

export async function drawPost(message) {
    const canvas = createCanvas(1280, 720)
    const context = canvas.getContext('2d')

    return canvas.toBuffer();
}