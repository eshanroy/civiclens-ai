import re


def normalize_text(text: str) -> str:
    """
    Normalize whitespace and line breaks.
    """

    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def normalize_for_matching(text: str) -> str:
    """
    Normalize text for tolerant matching.

    Removes:
    - punctuation
    - capitalization differences
    - extra whitespace
    """

    text = normalize_text(text)

    text = text.lower()

    text = re.sub(r"[^a-z0-9\s]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def find_evidence(text: str, phrase: str) -> str | None:
    """
    Find source evidence using multiple matching strategies.

    Strategy 1:
        Exact normalized phrase matching.

    Strategy 2:
        Punctuation-insensitive matching.

    Strategy 3:
        Keyword-based matching for OCR/wording differences.
    """

    if not text or not phrase:
        return None

    normalized_text = normalize_text(text)
    normalized_phrase = normalize_text(phrase)

    # ---------------------------------------------------------
    # STRATEGY 1: Exact normalized match
    # ---------------------------------------------------------

    text_lower = normalized_text.lower()
    phrase_lower = normalized_phrase.lower()

    index = text_lower.find(phrase_lower)

    if index != -1:

        start = max(0, index - 100)

        end = min(
            len(normalized_text),
            index + len(normalized_phrase) + 100
        )

        return normalized_text[start:end]

    # ---------------------------------------------------------
    # STRATEGY 2: Punctuation-insensitive match
    # ---------------------------------------------------------

    matching_text = normalize_for_matching(text)
    matching_phrase = normalize_for_matching(phrase)

    index = matching_text.find(matching_phrase)

    if index != -1:

        words = normalized_text.split()

        phrase_words = matching_phrase.split()

        for i in range(
            len(words) - len(phrase_words) + 1
        ):

            window = " ".join(
                words[i:i + len(phrase_words)]
            )

            if normalize_for_matching(window) == matching_phrase:

                start_word = max(0, i - 15)

                end_word = min(
                    len(words),
                    i + len(phrase_words) + 15
                )

                return " ".join(
                    words[start_word:end_word]
                )

    # ---------------------------------------------------------
    # STRATEGY 3: Keyword-based matching
    # ---------------------------------------------------------

    phrase_words = matching_phrase.split()

    # Remove very common words.
    stop_words = {
        "the",
        "a",
        "an",
        "has",
        "have",
        "been",
        "is",
        "was",
        "are",
        "were",
        "to",
        "of",
        "and",
        "in",
        "on",
        "for"
    }

    important_words = [
        word
        for word in phrase_words
        if word not in stop_words
    ]

    if not important_words:
        return None

    source_words = normalized_text.split()

    # Search through the document using a sliding window.
    window_size = max(
        len(phrase_words) + 10,
        20
    )

    for i in range(
        max(1, len(source_words) - window_size + 1)
    ):

        window_words = source_words[
            i:i + window_size
        ]

        window_text = normalize_for_matching(
            " ".join(window_words)
        )

        matched_count = sum(
            1
            for word in important_words
            if re.search(
                r"\b" + re.escape(word) + r"\b",
                window_text
            )
        )

        match_ratio = (
            matched_count / len(important_words)
        )

        # Require strong keyword overlap.
        if match_ratio >= 0.75:

            start_word = max(0, i - 5)

            end_word = min(
                len(source_words),
                i + window_size + 5
            )

            return " ".join(
                source_words[start_word:end_word]
            )

    return None