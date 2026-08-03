import JSZip from "https://esm.sh/jszip@3.10.1";
import NpyJS from "https://esm.sh/npyjs@0.5.0";

export async function loadNPZ(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const zip = await JSZip.loadAsync(buffer);
    const np = new NpyJS();
    const result = {};

    for (const name of Object.keys(zip.files)) {
        if (!name.endsWith(".npy")) continue;

        const fileBuf = await zip.files[name].async("arraybuffer");
        const parsed = await np.load(fileBuf);
        result[name.replace(".npy", "")] = parsed;
    }

    return result;
}
