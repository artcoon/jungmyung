/**
 * 🛡️ Harness Validator
 * AI 에이전트의 결과물을 정적 분석하여 실수를 방지합니다.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const HTML_FILE = path.join(PROJECT_ROOT, 'index.html');

let errors = [];
let warnings = [];

function checkHtml() {
    if (!fs.existsSync(HTML_FILE)) {
        errors.push("❌ index.html 파일을 찾을 수 없습니다.");
        return;
    }

    const content = fs.readFileSync(HTML_FILE, 'utf8');

    // 1. 기본 구조 체크
    if (!content.includes('<html lang=')) errors.push("❌ <html> 태그에 lang 속성이 누락되었습니다.");
    if (!content.includes('<title>')) errors.push("❌ <title> 태그가 없습니다.");

    // 2. 접근성 체크 (alt 태그)
    const imgWithoutAlt = content.match(/<img(?![^>]*\balt=)[^>]*>/g);
    if (imgWithoutAlt) {
        imgWithoutAlt.forEach(img => {
            errors.push(`❌ alt 속성이 없는 이미지 발견: ${img.substring(0, 50)}...`);
        });
    }

    // 3. 프리미엄 디자인 가드레일 (인라인 스타일 체크)
    const inlineStyles = content.match(/style="[^"]*"/g);
    if (inlineStyles && inlineStyles.length > 20) { // 어느 정도는 허용하되 과도한 인라인 스타일 경고
        warnings.push(`⚠️ 과도한 인라인 스타일이 발견되었습니다 (${inlineStyles.length}개). CSS 클래스로 옮기는 것을 권장합니다.`);
    }

    // 4. 다국어 시스템 체크
    if (content.includes('data-i18n') === false) {
        warnings.push("⚠️ data-i18n 다국어 시스템 속성이 발견되지 않았습니다. 다국어 지원 프로젝트인지 확인하세요.");
    }

    // 5. 하드코딩된 특정 색상 (예시)
    if (content.includes('color: red') || content.includes('color: blue')) {
        warnings.push("⚠️ 'red', 'blue' 등 기본 색상 키워드가 사용되었습니다. 프리미엄 디자인을 위해 curated palette를 사용하세요.");
    }
}

console.log("🔍 하네스 검증 시작...");

checkHtml();

console.log("\n--- 검증 결과 ---");

if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ 모든 검증을 통과했습니다! 완벽합니다.");
    process.exit(0);
}

if (warnings.length > 0) {
    warnings.forEach(w => console.warn(w));
}

if (errors.length > 0) {
    errors.forEach(e => console.error(e));
    console.log("\n🛑 에러가 발견되어 검증에 실패했습니다. 코드를 수정한 후 다시 실행하세요.");
    process.exit(1);
} else {
    console.log("\n✅ 경고 사항이 있으나 치명적인 에러는 없습니다.");
    process.exit(0);
}
