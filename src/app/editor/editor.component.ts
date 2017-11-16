import { Component, Input } from '@angular/core';
import { PluginComponent } from '../plugin/plugin.component';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { FileService } from '../file.service';
import { Store } from '@ngrx/store';
import { WindowService } from '../window.service';
import { FeatureService } from './feature/feature.service';
import { EditorState } from './editor.state';
import * as md5 from 'md5';

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements PluginComponent {
  @Input() metadata: any;
  public position: string;
  public editor$ = this.store$.select('editor');
  public terminalHidden: boolean = true;
  public readOnly: boolean = true;
  private models: any[] = [];
  private contents: string;
  
  constructor(
    public FileService: FileService,
    private FeatureService: FeatureService,
    private window: WindowService,
    private store$: Store<EditorState>,
  ) { }

  private get editor(): EditorState {
    let state = undefined;
    this.editor$.take(1).subscribe(_state => state = _state);
    return state;
  }

  public updatePosition(event) {
    const hasFeatureColLine = this.FeatureService.hasFeature(
      this.editor.language,
      'colLine'
    );
    if (hasFeatureColLine && event.column) {
      this.position = this.i18n.getMessage('EDITOR_COL_LINE_NUMBERS', [event.column, event.lineNumber]);
    } else {
      this.position = '';
    }
  }
  
  public closeProject() {
    this.store$.dispatch({
      type: 'editor:project:close'
    });
  }
  
  public openProject() {
    this.store$.dispatch({
      type: 'editor:project:new',
    });
  }
  
  public getTabName(tab) {
    const model = this.models.find(model => model.uri === tab.fullPath);
    const fileContents = model ? model.getValue() : '';
    const fileName = tab.name.split('/').pop();
    const filePrefix = tab.md5 !== md5(fileContents) ? '*' : '';
    return model ? `${filePrefix}${fileName}` : `${fileName}`;
  }
  
  public updateTabContents(contents) {
    this.contents = contents;
  }
  
  public updateModels(models) {
    this.models = models;
  }
  
  public saveTab(index: number = this.editor.selectedTab) {
    // if the editor is marked as read only do not allow
    // saving of the document.
    if (this.readOnly) return undefined;
    this.store$.dispatch({
      type: "editor:tab:save",
      payload: {
        tab: this.editor.tabs[index],
        contents: this.contents,
      }
    });
  }

  public removeTabs() {
    this.store$.dispatch({
      type: "editor:tabs:remove"
    });
  }
  
  public removeTab(index) {
    this.store$.dispatch({
      type: "editor:tab:remove",
      payload: index,
    });
  }
  
  public selectTab(index) {
    this.store$.dispatch({
      type: "editor:tab:select",
      payload: index,
    });
  }
  
  public createTabContextMenu(index, tab) {
    const contextMenu: any[] = [];
  
    contextMenu.push({
      label: 'Close Tab',
      onclick: this.removeTab.bind(this, index),
    });
    
    contextMenu.push({
      label: 'Close All Tabs',
      onclick: this.removeTabs.bind(this),
    });
    
    contextMenu.push({ hr: true });
  
    contextMenu.push({
      label: 'Select Tab',
      onclick: this.selectTab.bind(this, index),
    });
    
    return contextMenu;
  }
  
  public toggleTerminal() {
    this.terminalHidden = !this.terminalHidden;
  }

  get saveHandler() {
    return (() => {
      return this.saveTab.bind(this);
    }).call(this);
  }
  
  public readOnlyHandler(flag: boolean) {
    this.readOnly = flag;
  }
  
  get directoryContextMenu() {
    const contextMenu = [];

    if (this.editor && !!this.editor.directory) {
      contextMenu.push({
        label: "Close Project",
        onclick: this.closeProject.bind(this),
      });
    } else {
      contextMenu.push({
        label: "Open New Project",
        onclick: this.openProject.bind(this),
      });
    }
    
    return contextMenu;
  }

  get i18n() {
    return this.window.i18n;
  }
}
