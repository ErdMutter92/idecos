import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './app.component';
import { PluginDirective } from './plugin/plugin.directive';
import { PluginService } from './plugin/plugin.service';

import { EditorComponent } from './editor/editor.component';
import { FeatureService } from './editor/feature/feature.service';
import { DirectoryComponent } from './editor/directory/directory.component';
import { MonacoEditorDirective } from './editor/editor.directive';
import { LoadingComponent } from './loading/loading.component';
import { SettingsComponent } from './settings/settings.component';

import { WindowService } from './window.service';
import { FileService } from './file.service';
import { IdentityService } from './identity.service';
import { StorageService } from './storage.service';
import { SettingsService } from './settings/settings.service';

import { ModalService } from './editor/modal/modal.service';
import { ModalDirective } from './editor/modal/modal.directive';
import { NewEntryComponent } from './editor/newEntry/newEntry.component';
import { ConfirmComponent } from './editor/confirmation/confirm.component';
import { ContextMenuComponent } from './contextmenu/contextMenu.component';

// reducers
import { editorReducer } from './editor/editor.reducer';
import { settingsReducer } from './settings/settings.reducer';
import { EditorEffects } from './editor/editor.effects';
import { SettingsEffects } from './settings/settings.effects';
import { AppEffects } from './app.effects';

import { TerminalComponent } from './terminal/terminal.component';
import { TerminalDirective } from './terminal/terminal.directive';

import { ContextMenuDirective } from './contextmenu/contextMenu.directive';

@NgModule({
  declarations: [
    AppComponent,
    ContextMenuDirective,
    PluginDirective,
    ModalDirective,
    EditorComponent,
    MonacoEditorDirective,
    LoadingComponent,
    DirectoryComponent,
    TerminalComponent,
    TerminalDirective,
    SettingsComponent,
    NewEntryComponent,
    ConfirmComponent,
    ContextMenuComponent,
  ],
  entryComponents: [
    EditorComponent,
    TerminalComponent,
    LoadingComponent,
    SettingsComponent,
    NewEntryComponent,
    ConfirmComponent,
    ContextMenuComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.provideStore({
      editor: editorReducer,
      settings: settingsReducer
    }),
    EffectsModule.run(EditorEffects),
    EffectsModule.run(SettingsEffects),
    EffectsModule.run(AppEffects),
  ],
  providers: [
    PluginService,
    ModalService,
    WindowService,
    FileService,
    IdentityService,
    StorageService,
    FeatureService,
    SettingsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
