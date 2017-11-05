import { EditorLanguageMap } from './language.map';

export type EditorLanguage = 'markdown' | 'text' | 'javascript' | 'typescript' | 'python' | 'json' | 'html' | 'css';
export type EditorOptions = {
  lineNumbers: boolean,
  minimap: {
	 	enabled: boolean
	 },
  roundedSelection: boolean,
  scrollBeyondLastLine: boolean,
  wrappingColumn: number,
  wordWrap: boolean,
  folding: boolean,
  renderLineHighlight: boolean,
  overviewRulerLanes: number,
  customPreventCarriageReturn: boolean,
  automaticLayout: boolean,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'auto',
    useShadows: boolean
  }
};
export type EditorTheme = {
  base: 'vs' | 'vs-dark';
  inherit: boolean;
  rules: { [name: string ]: string}[];
  colors: { [name: string]: string };
}

export class EditorState {
  public directory;
  public options: EditorOptions = {
    lineNumbers: true,
    minimap: {
  	 	enabled: false
  	 },
    roundedSelection: false,
    scrollBeyondLastLine: false,
    wrappingColumn: 1,
    wordWrap: true,
    folding: true,
    renderLineHighlight: false,
    overviewRulerLanes: 0,
    customPreventCarriageReturn: true,
    automaticLayout: false,
    scrollbar: {
      vertical: 'hidden',
      horizontal: 'auto',
      useShadows: false
    }
  };
  public theme: EditorTheme = {
      base: 'vs',
      inherit: true,
      rules: [
        { background: 'EDF9FA' },
        { token: 'comment', foreground: '244b56', fontStyle: 'italic' }
      ],
      colors: {
          'editor.foreground': '#000000',
          'focusBorder': '#657B83',
          'editor.background': '#657B83',
          'editorCursor.foreground': '#8B0000',
          'editor.lineHighlightBackground': '#0000FF20',
          'editorLineNumber.foreground': '#073642',
          'editor.selectionBackground': '#88000030',
          'editor.inactiveSelectionBackground': '#88000015'
      }
  };

  public tabs: any[] = [];
  public selectedTab: number = 0;
  
  get activeFile() {
    return this.tabs[this.selectedTab];
  }
  
  get code() {
    return this.tabs[this.selectedTab] &&
           this.tabs[this.selectedTab].contents;
  }
  
  get language() {
    const extension = this.tabs[this.selectedTab] &&
                      this.tabs[this.selectedTab].name.split('.').pop();

    return EditorLanguageMap[extension] || 'text';
  }
  
  get hidden() {
    return this.code === undefined;
  }
}