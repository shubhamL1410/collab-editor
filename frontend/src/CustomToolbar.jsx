import React from "react";


export default function CustomToolbar() {
  return (
    <div id="custom-toolbar" className="toolbar">
      {/* Font Family */}
     <select className="ql-font" defaultValue="">
  <option value="">Sans Serif</option>
  <option value="serif">Serif</option>
  <option value="monospace">Monospace</option>
  <option value="arial">Arial</option>
  <option value="comic-sans">Comic Sans</option>
  <option value="courier-new">Courier New</option>
  <option value="georgia">Georgia</option>
  <option value="helvetica">Helvetica</option>
  <option value="lucida">Lucida</option>
  <option value="roboto">Roboto</option>
</select>

    

      {/* Heading */}
      <select className="ql-header" defaultValue="">
        <option value="">Normal</option>
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
      </select>

      {/* Text Styles */}
      <div className="toolbar-group">
        <button className="ql-bold" title="Bold (Ctrl+B)" />
        <button className="ql-italic" title="Italic (Ctrl+I)" />
        <button className="ql-underline" title="Underline (Ctrl+U)" />
        <button className="ql-strike" title="Strikethrough" />
      </div>

      {/* Script */}
      <div className="toolbar-group">
        <button className="ql-script" value="sub" title="Subscript" />
        <button className="ql-script" value="super" title="Superscript" />
      </div>

      {/* Lists and Indentation */}
      <div className="toolbar-group">
        <button className="ql-list" value="ordered" title="Ordered List" />
        <button className="ql-list" value="bullet" title="Bullet List" />
        <button className="ql-indent" value="-1" title="Decrease Indent" />
        <button className="ql-indent" value="+1" title="Increase Indent" />
      </div>

      {/* Color and Background */}
      <div className="toolbar-group">
        <select className="ql-color" title="Text Color" />
        <select className="ql-background" title="Background Color" />
      </div>

      {/* Alignments */}
      <div className="toolbar-group">
        <select className="ql-align" defaultValue="" title="Text Align">
          <option value="" />
          <option value="center" />
          <option value="right" />
          <option value="justify" />
        </select>
      </div>

      {/* Code, Quote, Media */}
      <div className="toolbar-group">
        <button className="ql-blockquote" title="Blockquote" />
        <button className="ql-code-block" title="Code Block" />
       
        <button className="ql-image" title="Insert Image" />
      </div>

      {/* Custom Actions */}
      <div className="toolbar-group right-align">
        <button className="ql-undo" title="Undo">↺</button>
        <button className="ql-redo" title="Redo">↻</button>
        <button className="ql-star" title="Star">⭐</button>
        <button className="ql-settings" title="Settings">⚙</button>
        <button className="ql-clean" title="Clear Formatting">🧹</button>
      </div>
    </div>
  );
}
