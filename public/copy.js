export const lines = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

function numberedGroups(list, pattern, count) {
  const starts = list.flatMap((line, index) =>
    pattern.test(line) ? [index] : [],
  );
  return starts
    .slice(0, count)
    .map((start, index) => list.slice(start, starts[index + 1] ?? list.length));
}

export function parseCopy(cells) {
  const hero = lines(cells.D7);
  const solution = cells.D10.trim().split(/✓\s*/);
  const allModel = lines(cells.D11);
  const modelStart = allModel.findIndex((line) => line.startsWith("MÔ HÌNH QUẢN LÝ TÀI SẢN"));
  const model = allModel.slice(modelStart);
  const layersIndex = model.findIndex((line) =>
    line.startsWith("03 TẦNG QUẢN TRỊ"),
  );
  // Vì sao chọn AAS: dòng không có "-" là tên nhóm, dòng "- Tiêu đề: Nội dung" là một lý do.
  const advantageGroups = [];
  for (const line of allModel.slice(1, modelStart)) {
    if (!line.startsWith("-")) {
      advantageGroups.push({ title: line, items: [] });
      continue;
    }
    const clean = line.replace(/^-\s*/, "");
    const split = clean.indexOf(":");
    advantageGroups.at(-1).items.push([clean.slice(0, split), clean.slice(split + 1).trim()]);
  }
  const compound = lines(cells.D14);
  const exampleIndex = compound.findIndex((line) => line.startsWith("NẾU 100"));
  const tickerIndex = compound.indexOf("FRT");
  const experts = cells.D17.trim()
    .split(/\n\s*\n/)
    .map(lines);
  const faq = cells.D18.trim().split(/\n\s*\d+\.\s*/);
  const plan = lines(cells.D16);
  return {
    cells,
    hero,
    heroCta: lines(cells.E7)[0],
    secondaryCta: lines(cells.E7)[1].replace("CTA phụ: ", ""),
    bookingTitle: cells.B2.split("CTA : ")[1],
    // D8: tiêu đề, rồi từng nỗi đau dạng "- Câu hỏi" (tuỳ chọn thêm " | Mô tả").
    painTitle: lines(cells.D8)[0],
    pain: lines(cells.D8)
      .filter((line) => line.startsWith("-"))
      .map((line) => {
        const [title, body = ""] = line.replace(/^-\s*/, "").split("|").map((part) => part.trim());
        return { title, body };
      }),
    bridge: cells.D9.trim(),
    // D10: tiêu đề giải pháp rồi các câu mô tả, sau đó là các đặc điểm "✓ …".
    solutionTitle: lines(solution[0])[0],
    solutionIntro: lines(solution[0]).slice(1),
    features: solution.slice(1).map((text) => {
      const [title, ...body] = lines(text);
      return { title, body: body.join(" ") };
    }),
    advantagesTitle: allModel[0],
    advantageGroups,
    model: {
      title: model[0],
      intro: model[1],
      assetsTitle: model[2],
      assets: numberedGroups(model.slice(3, layersIndex), /^0[1-4] \|/, 4),
      layersTitle: model[layersIndex],
      layers: numberedGroups(model.slice(layersIndex + 1), /^0[123] \|/, 3),
    },
    backtest: lines(cells.D12),
    comparison: lines(cells.D13).map((line) =>
      line
        .replace(/^-\s*/, "")
        .split("|")
        .map((cell) => cell.trim()),
    ),
    compound: {
      title: compound[0],
      intro: compound[1],
      factorsTitle: compound[2],
      factors: numberedGroups(compound.slice(3, exampleIndex), /^0[123] \|/, 3),
      exampleTitle: compound[exampleIndex],
      exampleIntro: compound[exampleIndex + 1],
      stocks: Array.from({ length: 4 }, (_, index) =>
        compound.slice(tickerIndex + index * 4, tickerIndex + index * 4 + 4),
      ),
      notice: compound.at(-1),
    },
    stepsTitle: lines(cells.D15)[0],
    steps: numberedGroups(lines(cells.D15).slice(1), /^0[1-5] —/, 5),
    // D16: tiêu đề, mô tả, chữ trên nút khảo sát.
    survey: { title: plan[0], subtitle: plan[1] },
    expertsTitle: experts[0][0],
    expertsIntro: experts[0].slice(1).join(" "),
    experts: experts.slice(1),
    faqTitle: faq[0].trim(),
    faqs: faq.slice(1).map((text) => {
      const [question, ...answer] = lines(text);
      return [
        question,
        answer.map((line) => line.replace(/^=>\s*/, "")).join("\n"),
      ];
    }),
    closing: lines(cells.D19),
  };
}
