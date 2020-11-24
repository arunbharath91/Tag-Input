import { Debounce } from "./decorators";

interface IOptions {
  option?: IOption;
  disabled?: boolean;
  data?: any[];
  chip?: any[];
  output?: Function;
  onChange?: Function;
  onbeforeAdd?: Function;
  onbeforeDelete?: Function;
  selfAdd?: boolean;
}

interface IOption { value: string };

const defaultOptions: IOptions = {
  chip: [],
  selfAdd: true,
  onbeforeDelete: () => { return true },
  onbeforeAdd: () => { return true }
}

export class TagInput {
  private selector: HTMLElement;
  private options: IOptions;
  private tagId: string;
  private input!: HTMLElement;
  private chipIndex = 0;
  private objectPattern = {} as any;
  private chipData!: any[];
  private optionValueParam!: string;
  private dataType!: string;
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
    if (this.options.data) this.config(this.options.data);
  }

  public data(data: any[]) {
    this.options.data = data;
    this.config(data);
  }

  private config(data: any[]) {
    if (data.length < 0) throw new Error('Expecting data...');
    try {
      this.optionValueParam = (this.options.option) ? this.options.option.value : '';
      this.dataType = (typeof (data[0]) === 'object') ? 'object' : 'array';
      this.chipData = (this.options.chip) ? this.options.chip : [];
      if (this.chipData.length > 0) this.insertChipFromOptions();

      if (this.options.selfAdd) {
        let pattern = '';
        Object.keys(data[0]).forEach((item) => {
          pattern += `"${item}": "",`
        });
        this.objectPattern = JSON.parse(`{${pattern.slice(0, -1)}}`);
      }

      this.insertDatalist(data);
    } catch (err) {
      console.log(err);
    }
  }

  private insertChipFromOptions() {
    this.chipData.forEach((item, index) => {
      this.chipIndex = this.chipIndex + 1;
      this.insertChip(item[`${this.options.option?.value}`], index);
    });
  }

  private insertDatalist(data: any[]) {
    let options = '';
    data.forEach((item, index) => {
      options += (this.dataType === 'object') ?
        `<option value="${item[this.optionValueParam]}" data-index="${index}"></option>` :
        `<option value="${item}" data-index="${index}"></option>`
    });
    (this.selector.querySelector(`#${this.tagId}`) as HTMLElement).innerHTML = options;
    this.eventRegistration();
  }

  private eventRegistration() {
    this.input.addEventListener('change', (e) => this.input_onChange(e));
    this.input.addEventListener('input', (e) => this.input_onInput(e));
    this.selector.addEventListener('click', (e) => { this.removeChip(e); }, false);
    this.input.addEventListener('keydown', (e) => this.keyboardEvents(e));
    if (this.options.selfAdd) {
      this.input.addEventListener('focusout', (e) => this.addSelfChip(e));
    }
  }

  @Debounce(2000)
  private input_onInput(e: any) {
    this.options.onChange?.call(this, e);
  }

  private keyboardEvents(e: any) {
    const input_Value = (e.target as HTMLInputElement).value;
    if (e.keyCode == 8 && input_Value.length <= 0 && this.chipData.length > 0) {
      const callback = this.options.onbeforeDelete?.call(this, this.chipData, this.options.data);
      if (callback) {
        this.chipData.pop();
        this.selector.querySelectorAll('.tag')[this.chipData.length].remove();
        this.options.output?.call(this, this.chipData);
      }

    }
    if (e.keyCode == 13 && this.options.selfAdd) {
      this.addSelfChip(e);
    }
  }

  private addSelfChip(e: any) {
    if (e.target.value.length <= 0) return;
    if (this.options.option?.value && this.dataType === 'object') {
      this.objectPattern[this.options.option?.value] = e.target.value;
    } else {
      this.objectPattern = e.target.value;
    }
    this.chipData.push(this.objectPattern);
    this.chipIndex = this.chipIndex + 1;
    this.addChip(e.target.value, this.chipIndex - 1);
    e.target.value = '';
  }

  private input_onChange(e: any) {
    const optionRef = this.selector.querySelector(`option[value="${e.target.value}"]`) as HTMLElement;

    if (optionRef) {
      const index = Number(optionRef.dataset.index);
      if (this.options.data) {
        this.chipData.push(this.options.data[index]);
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
    const callback = this.options.onbeforeAdd?.call(this, this.chipData, this.options.data);
    if (callback) {
      this.insertChip(chip, i);
      this.options.output?.call(this, this.options.chip);
    }
  }

  private removeChip(e: any) {
    const elem = (e.target as any);
    if (elem.className === 'chip_close') {
      const callback = this.options.onbeforeDelete?.call(this, this.chipData, this.options.data);
      if (callback) {
        this.chipData.splice(elem.id, 1);
        elem.parentNode.remove();
        this.options.output?.call(this, this.options.chip);
      }

    }
  }

}
