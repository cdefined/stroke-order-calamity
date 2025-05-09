const form = document.getElementById("kanjiForm");
const input = document.getElementById("kanjiInput");
const container = document.getElementById("kanjiContainer");
const header = document.getElementById("kanjiHeader");
const grid = document.getElementById("kanjiGrid");

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const DICTIONARY_BASE_URL = "https://jisho.org/search/";

const getKanjiData = async (kanji) => {
    const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`;
    try {
        const res = await fetch(url);

        if (!res.ok) throw new Error();
        const data = await res.json();

        return {
            found: true,
            kanji,
            meaning: data.meanings.join(", "),
            kunyomi: data.kun_readings,
            onyomi: data.on_readings,
            strokeCount: data.stroke_count,
            svgUrl: `${IMAGE_BASE_URL}${kanji.codePointAt(0).toString(16).padStart(5, "0")}.svg`,
            uri: `${DICTIONARY_BASE_URL}${encodeURIComponent(kanji)}%20%23kanji`,
        };
    } catch {
        return {
            found: false,
            kanji,
            meaning: null,
            kunyomi: [],
            onyomi: [],
            strokeCount: null,
            svgUrl: `${IMAGE_BASE_URL}${kanji.codePointAt(0).toString(16).padStart(5, "0")}.svg`,
            uri: `${DICTIONARY_BASE_URL}${encodeURIComponent(kanji)}%20%23kanji`,
        };
    }
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!form.reportValidity()) return;

    const value = input.value.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, "");
    header.innerHTML = "";
    grid.innerHTML = "";

    container.classList.add("loading");

    const chars = [...value];
    const results = await Promise.all(chars.map(getKanjiData));

    container.classList.remove("loading");
    grid.innerHTML = "";

    results.forEach((data, idx) => {
        const headSpan = document.createElement("button");
        headSpan.textContent = data.kanji;
        headSpan.className = "kanji-link";
        headSpan.dataset.index = idx;
        header.appendChild(headSpan);

        const div = document.createElement("div");
        div.className = "kanji-box";
        div.dataset.index = idx;

        const img = document.createElement("img");
        img.src = data.svgUrl;
        img.alt = `Stroke order for ${data.kanji}`;
        img.className = "kanji-image";
        div.appendChild(img);

        if (data.found) {
            div.innerHTML += `
                <div><strong>${data.meaning}</strong></div>
                <div class="small"><strong>Kun:</strong> ${data.kunyomi.join(", ") || "—"}</div>
                <div class="small"><strong>On:</strong> ${data.onyomi.join(", ") || "—"}</div>
                <a class="small" href="${data.uri}" target="_blank">More details</a>
            `;
        }

        grid.appendChild(div);
    });

    document.querySelectorAll(".kanji-link").forEach((el) => {
        el.addEventListener("click", () => {
            const idx = el.dataset.index;
            document.querySelectorAll(".kanji-box").forEach((box) => {
                box.classList.remove("highlight");
            });
            const target = document.querySelector(`.kanji-box[data-index="${idx}"]`);
            if (target) {
                target.classList.add("highlight");
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });
});
