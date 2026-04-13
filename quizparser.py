input_file = "input.txt"

questions_file = "qsn.txt"
answers_file = "ans.txt"
errors_file = "errors.txt"

questions = []
answers = []
errors = []

with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

blocks = []
current_block = []
start_line = 0

# --- STEP 1: Build blocks with line numbers ---
for i, line in enumerate(lines, start=1):
    stripped = line.strip()

    if stripped == "++++":
        if current_block:
            blocks.append((start_line, current_block))
            current_block = []
        start_line = i
    else:
        if not current_block:
            start_line = i
        current_block.append(line.rstrip("\n"))

# last block
if current_block:
    blocks.append((start_line, current_block))


# --- STEP 2: Process blocks ---
for block_index, (line_no, block_lines) in enumerate(blocks, start=1):
    raw_block = "\n".join(block_lines)
    block_text = "\n".join(block_lines)

    parts = [p.strip() for p in block_text.split("====") if p.strip()]

    # Validation 1: enough parts
    if len(parts) < 3:
        errors.append(
            f"[Block {block_index} | Line {line_no}] ❌ Not enough parts\n{raw_block}\n"
        )
        continue

    # Collapse multiline question
    question_raw = parts[0]
    question = " ".join(question_raw.split())

    options_raw = parts[1:]

    correct_answers = []
    cleaned_options = []

    for opt in options_raw:
        opt_clean = " ".join(opt.split())

        if not opt_clean:
            continue

        if opt_clean.startswith("#"):
            val = opt_clean.replace("#", "").strip()
            correct_answers.append(val)
            cleaned_options.append(val)
        else:
            cleaned_options.append(opt_clean)

    # Validation 2: correct answer count
    if len(correct_answers) == 0:
        errors.append(
            f"[Block {block_index} | Line {line_no}] ❌ No correct answer\n{raw_block}\n"
        )
        continue

    if len(correct_answers) > 1:
        errors.append(
            f"[Block {block_index} | Line {line_no}] ❌ Multiple correct answers: {correct_answers}\n{raw_block}\n"
        )
        continue

    correct_answer = correct_answers[0]

    # Validation 3: enough options
    if len(cleaned_options) < 2:
        errors.append(
            f"[Block {block_index} | Line {line_no}] ❌ Not enough options\n{raw_block}\n"
        )
        continue

    # Validation 4: suspicious answers
    if correct_answer.lower() in [
        "barcha javoblar to‘g‘ri",
        "to‘g‘ri javob berilmagan"
    ]:
        errors.append(
            f"[Block {block_index} | Line {line_no}] ⚠️ Suspicious answer: {correct_answer}\n"
        )

    questions.append(question)
    answers.append(correct_answer)


# --- STEP 3: Write outputs ---
with open(questions_file, "w", encoding="utf-8") as qf:
    for q in questions:
        qf.write(q + "\n")

with open(answers_file, "w", encoding="utf-8") as af:
    for a in answers:
        af.write(a + "\n")

with open(errors_file, "w", encoding="utf-8") as ef:
    for e in errors:
        ef.write(e + "\n")


# --- SUMMARY ---
print("==== SUMMARY ====")
print(f"Total blocks: {len(blocks)}")
print(f"Valid: {len(questions)}")
print(f"Errors: {len(errors)}")