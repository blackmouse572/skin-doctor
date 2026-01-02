export async function fromBodyToBase64Helper(images: File[]) {
  const results: string[] = [];
  for (const image of images) {
    const byteArrBuffer = await image.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(byteArrBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    results.push(`data:${image.type};base64,${base64String}`);
  }

  return results;
}
