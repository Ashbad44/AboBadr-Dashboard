'use client';

import { useTextStyles, styleToCss } from '../lib/TextStylesContext';
import StyleToolbar from './StyleToolbar';

// Usage: <StyledLabel type="label" id="branches_panel_title" text={t('branches_panel_title')} as="h3" className="panel-title" />
export default function StyledLabel({ type, id, text, as: Tag = 'span', className, showToolbar = true }) {
  const { getStyle } = useTextStyles();
  const style = styleToCss(getStyle(type, id));

  return (
    <span className="styled-label-wrap">
      <Tag className={className} style={style}>{text}</Tag>
      {showToolbar && <StyleToolbar type={type} id={id} />}
    </span>
  );
}
