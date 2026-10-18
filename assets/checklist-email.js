(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const dialog = el('email-dialog');
  const form = el('email-form');
  const recipient = el('email-recipient');
  const preview = el('email-preview');
  const status = el('email-status');
  const composeLink = el('email-compose-link');
  let opener;
  const subject = () => '[경매 준비 체크리스트] ' + (el('church').value.trim() || '우리 교회');
  el('email-open').addEventListener('click', () => {
    opener = document.activeElement;
    preview.value = window.ChecklistReport.createReport(document);
    status.textContent = '';
    composeLink.hidden = true;
    dialog.showModal();
    recipient.focus();
  });
  el('email-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  recipient.addEventListener('input', () => { composeLink.hidden = true; status.textContent = ''; });
  async function copyReport() {
    try {
      await navigator.clipboard.writeText(preview.value);
      return true;
    } catch (_) {
      preview.focus();
      preview.select();
      try { return document.execCommand('copy'); } catch (_) { return false; }
    }
  }
  function composeUrl(provider) {
    const to = recipient.value.trim();
    // The complete report travels via the clipboard, avoiding URL length limits.
    return provider === 'gmail'
      ? 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + encodeURIComponent(subject())
      : 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject());
  }
  async function prepare(provider) {
    if (!form.reportValidity()) return;
    const url = composeUrl(provider);
    composeLink.href = url;
    composeLink.textContent = provider === 'gmail' ? 'Gmail 작성 화면 다시 열기' : '메일 앱 작성 화면 다시 열기';
    composeLink.removeAttribute('target');
    composeLink.removeAttribute('rel');
    composeLink.hidden = false;
    const copied = await copyReport();
    if (copied) {
      status.textContent = '전체 본문을 복사했습니다. 열린 메일의 본문에 붙여 넣은 뒤 전송을 눌러 주세요. 창이 열리지 않으면 아래 링크를 눌러 주세요.';
      // Same-tab navigation works even when popups are blocked. Checklist fields
      // are already saved locally, and remain available with the Back button.
      if (provider === 'gmail') window.location.assign(url);
      else composeLink.click();
    } else {
      status.textContent = '자동 복사가 허용되지 않았습니다. 이 창의 미리보기 내용을 직접 복사해 메일 본문에 붙여 넣어 주세요. 창이 열리지 않으면 아래 링크를 눌러 주세요.';
      preview.focus(); preview.select();
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); prepare('mailto'); });
  el('email-gmail').addEventListener('click', () => prepare('gmail'));
  el('email-copy').addEventListener('click', async () => {
    status.textContent = await copyReport()
      ? '전체 본문을 복사했습니다. 사용하는 메일의 본문에 붙여 넣어 주세요.'
      : '자동 복사가 허용되지 않았습니다. 선택된 미리보기 내용을 직접 복사해 주세요.';
  });
  function base64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  el('email-download').addEventListener('click', () => {
    if (recipient.value && !recipient.reportValidity()) return;
    const body = base64(preview.value.replace(/\r?\n/g, '\r\n')).match(/.{1,76}/g).join('\r\n');
    const headers = [
      'To: ' + recipient.value.trim(),
      'Subject: =?UTF-8?B?' + base64('[경매 준비 체크리스트]') + '?=',
      'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64', 'X-Unsent: 1'
    ];
    const blob = new Blob([headers.join('\r\n') + '\r\n\r\n' + body + '\r\n'], {type:'message/rfc822'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = '경매_준비_체크리스트.eml'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = '이메일 파일 저장을 요청했습니다. 내려받은 파일을 지원하는 메일 앱에서 열고 전송해 주세요. 아직 이메일이 발송된 것은 아닙니다.';
  });
})();
