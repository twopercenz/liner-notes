// 가사 위에 마우스로 드래그한 부분을 "몇 번째 글자부터 몇 번째 글자까지"로
// 바꿔주는 유틸리티. DOM Selection API는 텍스트 노드+오프셋으로 위치를 주는데,
// 우리가 저장하고 싶은 건 entries.lyrics 원본 문자열 기준 순수한 문자 인덱스라서
// 그 사이를 변환해준다.

/**
 * container의 시작부터 (node, nodeOffset) 지점까지를 Range로 잡아
 * 그 Range의 텍스트 길이를 재는 방식으로 "순수 문자 오프셋"을 구한다.
 * container 안의 모든 자식(하이라이트 span 포함)의 textContent를 이어붙인 것이
 * 원본 lyrics 문자열과 정확히 같아야 정확하게 동작한다.
 */
function getOffsetInContainer(
  container: Node,
  node: Node,
  nodeOffset: number
): number {
  const range = document.createRange();
  range.selectNodeContents(container);
  range.setEnd(node, nodeOffset);
  return range.toString().length;
}

export interface SelectionOffsets {
  start: number;
  end: number;
  text: string;
}

/**
 * 현재 브라우저 선택 영역(window.getSelection())이 container 안에서 이루어졌을 때,
 * 그 선택 영역을 순수 문자 오프셋 [start, end)로 변환한다.
 * 선택이 없거나, container 밖에서 이루어졌거나, 비어있으면 null.
 */
export function getSelectionOffsets(
  container: HTMLElement
): SelectionOffsets | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (
    !container.contains(range.startContainer) ||
    !container.contains(range.endContainer)
  ) {
    return null;
  }

  const start = getOffsetInContainer(
    container,
    range.startContainer,
    range.startOffset
  );
  const end = getOffsetInContainer(
    container,
    range.endContainer,
    range.endOffset
  );
  const text = range.toString();

  if (start === end || !text.trim()) return null;

  return { start: Math.min(start, end), end: Math.max(start, end), text };
}

export interface TextSegment<A> {
  text: string;
  annotation: A | null;
}

interface OffsetRange {
  start_offset: number;
  end_offset: number;
}

/**
 * 가사 원문(text)을 annotations의 구간대로 잘라서
 * [일반 텍스트, 하이라이트할 텍스트, 일반 텍스트, ...] 순서의 세그먼트 배열로 만든다.
 * 서로 겹치는 구간이 있으면 먼저(start_offset이 작은) 것을 우선하고 겹치는 뒤엣것은 건너뛴다.
 */
export function buildSegments<A extends OffsetRange>(
  text: string,
  annotations: A[]
): TextSegment<A>[] {
  const sorted = [...annotations].sort(
    (a, b) => a.start_offset - b.start_offset
  );

  const segments: TextSegment<A>[] = [];
  let cursor = 0;

  for (const ann of sorted) {
    const start = Math.max(0, Math.min(ann.start_offset, text.length));
    const end = Math.max(0, Math.min(ann.end_offset, text.length));
    if (start < cursor || end <= start) continue; // 겹치거나 잘못된 구간은 건너뜀

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), annotation: null });
    }
    segments.push({ text: text.slice(start, end), annotation: ann });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), annotation: null });
  }

  return segments;
}
