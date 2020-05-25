import { Debounce } from "./decorators";

interface IOptions {
  option?: IOption;
  disabled?: boolean;
  data?: any[];
  chip: any[];
  output?: Function;
  onChange?: Function;
  selfAdd?: boolean;
}

interface IOption { value: string, label: string};

const defaultOptions: IOptions = {
  chip: [],
  selfAdd: true
}

export class TagInput {
  private selector: HTMLElement;
  private options: IOptions;
  private tagId: string;
  private input!: HTMLElement;
  private chipIndex = 0;
  private objectPattern = {} as any;
  //private chipData: any[];
  constructor(selector: string, options: IOptions) {
    this.selector = (document.querySelector(selector) as HTMLElement);
    this.options = { ...defaultOptions, ...options };
    this.tagId = `tagId${(new Date()).getTime()}`;
    this.insertTemplate();
    this.initFromOptions();
  }

  private insertTemplate() {
    const input = `
    <input type="text" id="in_${this.tagId}" list="${this.tagId}" class="form-control"/>
    <datalist id="${this.tagId}">
    </datalist>`;
    this.selector.insertAdjacentHTML('beforeend', input);
    this.input = (this.selector.querySelector(`#in_${this.tagId}`) as HTMLElement);
  }

  private initFromOptions() {
    if (this.options.data) {
      this.insertDatalist(this.options.data);
    }
  }

  public data(data: any[]) {
    if (data) this.options.data = data;
    this.insertDatalist(data);
  }

  private insertDatalist(data: any[]) {
    if (data.length < 0) throw new Error('Expecting data...');
    if (this.options.chip.length > 0) this.insertChipFromOptions();
    if(this.options.selfAdd) {
    let pattern = '';
    Object.keys(data[0]).forEach((item) => {
      pattern += `"${item}": "",`
    });
    this.objectPattern = JSON.parse(`{${pattern.slice(0,-1)}}`);
    }
    let options = '';
    data.forEach((item, index) => {
      options += (this.options.option) ?
        `<option value="${item[this.options.option.value]}" label="${item[this.options.option ?.label]}" data-index="${index}"></option>` :
        `<option value="${item}" data-index="${index}"></option>`
    });
    (this.selector.querySelector(`#${this.tagId}`) as HTMLElement).innerHTML = options;
    this.eventRegistration();
  }

  private insertChipFromOptions() {
      this.options.chip.forEach((item, index) => {
        this.chipIndex = this.chipIndex + 1;
        this.insertChip(item[`${this.options.option ?.value}`], index);
      });
  }

  private eventRegistration() {
    this.input.addEventListener('change', (e) => this.input_onChange(e));
    this.input.addEventListener('input', (e) => this.input_onInput(e));
    this.selector.addEventListener('click', (e) => { this.removeChip(e); }, false);
    this.input.addEventListener('keydown', (e) => {
    this.keyboardEvents(e);
    });
  }

  @Debounce(2000)
  private input_onInput(e: any) {
    this.options.onChange ?.call(this, e);
  }

  private keyboardEvents(e: any){
    const in_Value = (e.target as HTMLInputElement).value;
    if(e.keyCode == 8 && in_Value.length <= 0 && this.options.chip.length > 0) {
      this.options.chip.pop();
      this.selector.querySelectorAll('.tag')[this.options.chip.length].remove();
      this.options.output ?.call(this, this.options.chip);
    }
    if(e.keyCode == 13 && this.options.selfAdd) {
      if(this.options.option?.value) this.objectPattern[this.options.option?.value] = e.target.value;
      this.options.chip.push(this.objectPattern);
      this.chipIndex = this.chipIndex + 1;
      this.addChip(e.target.value, this.chipIndex - 1);
      e.target.value = '';
    }
  }

  private input_onChange(e: any) {
    const optionRef = this.selector.querySelector(`option[value="${e.target.value}"]`) as HTMLElement;

    if (optionRef) {
      const index = Number(optionRef.dataset.index);
      if (this.options.data) {
        this.options.chip.push(this.options.data[index]);
      }

      this.chipIndex = this.chipIndex + 1;
      this.addChip(e.target.value, this.chipIndex - 1);
      e.target.value = '';
    }

  }

  private insertChip(chip: any, i: number) {
    const chipDiv = document.createElement('div');
    chipDiv.className = `tag`;
    chipDiv.innerHTML = chip;
    chipDiv.insertAdjacentHTML('beforeend', `<i class="chip_close" id="${i}">&#10005;</i>`);
    this.selector.insertBefore(chipDiv, this.input);
  }

  private addChip(chip: any, i: number) {
    this.insertChip(chip, i);
    this.options.output ?.call(this, this.options.chip);
  }

  private removeChip(e: any) {
    const elem = (e.target as any);
    if (elem.className === 'chip_close') {
      this.options.chip.splice(elem.id, 1);
      elem.parentNode.remove();
      this.options.output ?.call(this, this.options.chip);
    }
  }

}
