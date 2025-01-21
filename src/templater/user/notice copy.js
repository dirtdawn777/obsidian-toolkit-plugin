async function notice(tp, text) {
    new tp.obsidian.Notice(text, 5000);
}

module.exports = notice
