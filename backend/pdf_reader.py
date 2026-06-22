import fitz
import os


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def extract_text_from_path(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return extract_text_from_pdf(f.read())
