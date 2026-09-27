import pymupdf


def extract_text_from_pdf(file_bytes: bytes) -> str:
    document = pymupdf.open(
        stream=file_bytes,
        filetype="pdf"
    )

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text.strip()