
document.addEventListener("DOMContentLoaded", function () {
    const languageSelect = document.getElementById("id_language");

    const fields = [
        {
            id: "id_title",
            type: "title",
        },
        {
            id: "id_excerpt",
            type: "excerpt",
        },
        {
            id: "id_content",
            type: "content",
        },
    ];

    const contentField = document.getElementById("id_content");

    let preview = null;

    if (contentField) {
        const fieldRow = contentField.closest(".form-row");

        if (fieldRow) {
            preview = document.createElement("div");
            preview.className = "urdu-live-preview";
            preview.style.display = "none";

            const label = document.createElement("div");
            label.className = "urdu-live-preview-label";
            label.textContent = "URDU LIVE PREVIEW";

            const previewText = document.createElement("div");
            previewText.className = "urdu-live-preview-text";

            preview.appendChild(label);
            preview.appendChild(previewText);

            fieldRow.appendChild(preview);
        }
    }

    function updateLanguage() {
        const isUrdu = languageSelect?.value === "ur";

        fields.forEach(function (field) {
            const element = document.getElementById(field.id);

            if (!element) return;

            element.dir = isUrdu ? "rtl" : "ltr";
            element.lang = isUrdu ? "ur" : "en";

            element.classList.toggle(
                "urdu-literature-field",
                isUrdu
            );

            element.classList.toggle(
                "english-literature-field",
                !isUrdu
            );

            if (field.type === "content") {
                element.classList.toggle(
                    "urdu-literature-content",
                    isUrdu
                );
            }
        });

        if (preview) {
            preview.style.display = isUrdu ? "block" : "none";
            updatePreview();
        }
    }

    function updatePreview() {
        if (!preview || !contentField) return;

        const previewText = preview.querySelector(
            ".urdu-live-preview-text"
        );

        previewText.textContent =
            contentField.value || "یہاں آپ کی اردو تحریر نظر آئے گی۔";
    }

    if (languageSelect) {
        languageSelect.addEventListener("change", updateLanguage);
    }

    if (contentField) {
        contentField.addEventListener("input", updatePreview);
    }

    updateLanguage();
});
