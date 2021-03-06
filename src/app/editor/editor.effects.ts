import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../file.service';
import { StorageService } from '../storage.service';
import { Store } from '@ngrx/store';

@Injectable()
export class EditorEffects {
  constructor(
    private actions$: Actions,
    private FileService: FileService,
    private StorageService: StorageService,
    private store$: Store<any>,
  ) { }
  
  private openProject() {
    const processDirectory = this.FileService.processDirectory;
    const readDirectory = this.FileService.readDirectory;
    const processFiles = this.FileService.processFiles;
    
    let rootDirectory;
    const projectPromises = this.FileService.openDirectory()
      .then(directory => {
        rootDirectory = directory;
        return directory;
      })
      .then(readDirectory)
      .then(processDirectory)
      .then(processFiles)
      .then(subEntries => {
        rootDirectory.contents = subEntries;
        return this.FileService.sortDirectories(rootDirectory);
      });
    
    return projectPromises;
  }
  
  private openDirectory(_directory?) {
    const readDirectory = this.FileService.readDirectory;
    const processSingleDirectory = this.FileService.processSingleDirectory;
    const processFiles = this.FileService.processFiles;
    let rootDirectory;

    const initPromise = !!_directory ?
      Promise.resolve(_directory) :
      this.FileService.openDirectory();

    const projectPromises = initPromise
      .then(directory => {
        rootDirectory = directory;
        return directory;
      })
      .then(readDirectory)
      .then(processSingleDirectory)
      .then(processFiles)
      .then(subEntries => {
        rootDirectory.contents = subEntries;
        return this.FileService.sortDirectories(rootDirectory);
      });
    
    return projectPromises;
  }
  
  @Effect({
    dispatch: true,
  })
  private updateFileTree$ = this.actions$
    .ofType('editor:open:directory')
    .switchMap((action) => {
      const directoryPromise = this.openDirectory(action.payload)
      return Observable.fromPromise(directoryPromise)
        .map(directory => {
          return {
            type: 'editor:directory:update',
            payload: {
              child: directory,
              parent: action.payload,
            },
          };
        });
    });


  @Effect({
    dispatch: true,
  })
  private initProject$ = this.actions$
    .ofType('@ngrx/store/init')
    .switchMap(() => {
      const projectPromise = this.openProject();
      return Observable.fromPromise(projectPromise)
        .map(directory => {
          return {
            type: 'editor:directory:load',
            payload: directory,
          };
        });
    });
  
  @Effect({
    dispatch: true,
  })
  private newProject$ = this.actions$
    .ofType('editor:project:new')
    .switchMap((action, index) => {
      return Observable.of({
        type: 'editor:project:close',
      },{
        type: 'editor:project:open',
      });
    });
    
  @Effect({
    dispatch: true,
  })
  private openAllDirectories$ = this.actions$
    .ofType('editor:project:open_all')
    .switchMap((action) => {
      const directoryPromise = this.openProject()
      return Observable.fromPromise(directoryPromise)
        .map(directory => {
          return {
            type: 'editor:directory:update',
            payload: {
              child: directory,
              parent: action.payload,
            },
          };
        });
    });
  
  @Effect({
    dispatch: true,
  })
  private loadProject$ = this.actions$
    .ofType('editor:project:open')
    .switchMap((action, index) => {
      const projectPromise = this.openDirectory();
      return Observable.fromPromise(projectPromise);
    })
    .switchMap((directory) => {
      return Observable.from([{
        type: 'editor:directory:load',
        payload: directory,
      }]);
    });


  @Effect({
    dispatch: true,
  })
  private closeProject$ = this.actions$
    .ofType('editor:project:close')
    .switchMap((action, index) => {
      return Observable.fromPromise(this.StorageService.remove('directoryKey'));
    })
    .switchMap(() => {
      return Observable.of({
        type: 'editor:directory:unload'
      });
    });


  @Effect({
    dispatch: false,
  })
  private saveTab$ = this.actions$
    .ofType('editor:tab:save')
    .switchMap((action, index) => {
      const { tab, contents } = action.payload;
      const savePromise = this.FileService.saveFile(tab, contents);
      return Observable.fromPromise(savePromise);
    });
    
  @Effect({
    dispatch: true,
  })
  private newFile$ = this.actions$
    .ofType('editor:file:create')
    .switchMap((action, index) => {
      const { directory, name } = action.payload;
      const createFilePromise = this.FileService.newFile(directory, name);
      return Observable.fromPromise(createFilePromise.then(() => {
        return directory;
      }));
    })
    .switchMap((directory, index) => {
      return Observable.of({
        type: 'editor:open:directory',
        payload: directory,
      });
    });
    
  @Effect({
    dispatch: true,
  })
  private newDirectory$ = this.actions$
    .ofType('editor:folder:create')
    .switchMap((action, index) => {
      const { directory, name } = action.payload;
      const createfolderPromise = this.FileService.createDirectory(directory, name);
      return Observable.fromPromise(createfolderPromise.then(() => {
        return directory;
      }));
    })
    .switchMap((directory, index) => {
      return Observable.of({
        type: 'editor:open:directory',
        payload: directory,
      });
    });
    
  @Effect({
    dispatch: true,
  })
  private removeFile$ = this.actions$
    .ofType('editor:file:remove')
    .switchMap((action, index) => {
      const { root, entry } = action.payload;
      const removeFilePromise = this.FileService.removeFile(entry);
      return Observable.fromPromise(removeFilePromise.then(() => {
        return root;
      }))
    })
    .switchMap((directory, index) => {
      return Observable.of({
        type: 'editor:open:directory',
        payload: directory,
      });
    });

  @Effect({
    dispatch: true,
  })
  private closeAllTabs$ = this.actions$
    .ofType('editor:tabs:remove')
    .withLatestFrom(this.store$)
    .map(([action, state]: [any, any]) => {
      action.payload = Object.assign(action.payload || {}, {
        tabs: state['editor'].tabs.slice(0),
      });
      return action;
    }) 
    .switchMap(action => {
      const tabsToClose = action.payload.tabs.map((tab, index) => {
        return {
          type: 'editor:tab:remove',
          payload: (action.payload.tabs.length - index) - 1,
        };
      });
      return Observable.from(tabsToClose);
    });
}