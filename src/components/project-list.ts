import { autoBind } from "../decorators/autobind";
import { Component } from "./base-component";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";
import { DragTarget } from "../models/drag-drop";


export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  };

  @autoBind
  dragOverHandler(event: DragEvent) {

    // is the data attached to that event, is it in that format?
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // the default behavior is to not allow drop
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }

  };

  @autoBind
  dropHandler(event: DragEvent) {
    const prjID = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(prjID, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
  };

  @autoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  };

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const releventProjects = projects.filter((project) => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;

      });
      this.assignedProjects = releventProjects;
      this.renderProjects();
    });
  };

  renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  };

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;


    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  };

};