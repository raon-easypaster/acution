/* Plain-text export shared by email preview and file downloads. */
(function (root) {
  'use strict';
  function createReport(doc) {
    const value = id => doc.getElementById(id)?.value.trim() || '미입력';
    const fields = [...doc.querySelectorAll('[data-save]')];
    const checks = fields.filter(field => field.type === 'checkbox');
    const lines = [
      '우리 교회의 경매 준비 체크리스트',
      '교회명: ' + value('church'),
      '작성자: ' + value('writer'),
      '작성일: ' + value('written_date'),
      `확인한 항목: ${checks.filter(field => field.checked).length} / ${checks.length}`,
      '금액 단위: 만 원',
      '체크하지 않은 항목은 확인 필요로 표시합니다.',
      ''
    ];
    doc.querySelectorAll('main section.section').forEach(section => {
      lines.push('━━━━━━━━━━━━━━━━━━━━', section.querySelector('h2').textContent.trim(), '');
      // Keep the on-screen order, including subtotals and action group headings.
      section.querySelectorAll('h3, [data-save], output, #monthly-difference, #cash-gap').forEach(node => {
        if (node.matches('h3')) {
          lines.push('', '【' + node.textContent.trim() + '】');
        } else if (node.matches('output')) {
          const label = node.id === 'old_total' ? '현재 월 합계' : node.id === 'new_total' ? '매입 후 월 합계' : '대출 외에 마련할 총자금';
          lines.push(label + ': ' + node.textContent.trim() + '만 원');
        } else if (node.matches('#monthly-difference, #cash-gap')) {
          lines.push(node.textContent.trim());
        } else if (node.type === 'checkbox') {
          lines.push((node.checked ? '[확인] ' : '[확인 필요] ') + node.closest('label').textContent.trim());
        } else if (node.type === 'radio') {
          if (node.checked) lines.push('현재 판단: ' + node.closest('label').textContent.trim());
          else if (node.id === 'decision-0' && !section.querySelector('input[type=radio]:checked')) lines.push('현재 판단: 미입력');
        } else {
          const label = node.labels?.[0]?.textContent.trim() || node.id;
          lines.push(label + ': ' + (node.value.trim() || '미입력'));
        }
      });
      lines.push('');
    });
    const warning = doc.getElementById('loan-warning');
    if (warning && !warning.hidden) lines.push('주의: ' + warning.textContent.trim(), '');
    lines.push('모든 체크가 입찰 승인을 뜻하지는 않습니다. 미확인 문제와 중단 기준을 다시 살펴보세요.',
      'https://raon-easypaster.github.io/acution/');
    return lines.join('\n');
  }
  root.ChecklistReport = { createReport };
})(typeof window === 'undefined' ? globalThis : window);
