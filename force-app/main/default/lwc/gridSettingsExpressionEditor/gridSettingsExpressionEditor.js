import { LightningElement, api, track } from 'lwc';
import { Labels, Operations, evaluateExpression, getFieldOperationByType } from "c/gridSettingsHelper";

export default class GridSettingsExpressionEditor extends LightningElement {
    @api criteriasWrapperjson;
    @api confirmEvent;
    @api cardLabel;
    @track Loading = false;
    @track fieldOptions = [];
    @track fieldsMap = {};
    @track criterias = [];
    @track criteriaLogiqueOptions = [
        { label: 'All conditions are met', value: 'AND' },
        { label: 'Any condition is realized', value: 'OR' },
        { label: 'Define your own logique', value: '' }
    ];
    get criteriasMap() {
        let rulesMap = {};
        for (let index = 0; this.criterias && index < this.criterias.length; index++) {
            rulesMap[index + 1] = this.criterias[index];
        }
        return rulesMap;
    }
    @track expression = '';
    @track Label = Labels;
    @track Operations = Operations;
    @track booleanValueOptions = [
        {
            label: Labels.LBL_True,
            value: 'true'
        },
        {
            label: Labels.LBL_False,
            value: 'false'
        }
    ];
    @api updateFields(criteriasWrapperjson) {
        this.criteriasWrapperjson = criteriasWrapperjson;
        this.setComponent();
    }
    connectedCallback() {
        this.setComponent();
    }
    setComponent() {
        let self = this;
        this.Loading = true;
        try {
            if (this.criteriasWrapperjson) {
                let criteriasWrapper = JSON.parse(this.criteriasWrapperjson);
                let criterias = [];
                if (criteriasWrapper) {
                    if (criteriasWrapper.fieldsMap) {
                        this.fieldsMap = criteriasWrapper.fieldsMap;
                        let fieldOptions = [{ label: Labels.LBL_None, value: '' }];
                        Object.values(criteriasWrapper.fieldsMap).filter(item => item.isFilterable).sort((item1, item2) => item1.fieldLabel.localeCompare(item2.fieldLabel)).forEach(item => {
                            item.isRecordTypeId = item.fieldName.toLowerCase().includes('recordtypeid');
                            item.isText = item.fieldType === 'STRING' || item.fieldType === 'PICKLIST' || item.fieldType === 'MULTIPICKLIST';
                            item.isNumber = item.fieldType === 'DOUBLE'
                                || item.fieldType === 'INTEGER'
                                || item.fieldType === 'LONG'
                                || item.fieldType === 'PERCENT'
                                || item.fieldType === 'CURRENCY';
                            item.isCalculated = item.isCalculated || item.fieldLabel.includes('>') || item.fieldType == 'ID';
                            item.isBoolean = item.fieldType === 'BOOLEAN';
                            item.isDate = item.fieldType === 'DATE';
                            item.isDateTime = item.fieldType === 'DATETIME';
                            item.isTime = item.fieldType === 'TIME';
                            item.isReference = item.fieldType === 'REFERENCE';
                            item.isNumberOrBoolean = item.isNumber || item.isBoolean;
                            item.isNumberOrBooleanOrTextOrRecordTypeId = item.isNumberOrBoolean || item.isText || item.isRecordTypeId;
                            fieldOptions.push({ label: item.fieldLabel, value: item.fieldName });
                        })
                        this.fieldOptions = fieldOptions;
                    }
                    if (criteriasWrapper.rulesMap) {
                        let keys = Object.keys(criteriasWrapper.rulesMap).sort((key1, key2) => key1.localeCompare(key2));
                        let fieldsMap = this.fieldsMap;
                        for (let index = 1; index <= keys[keys.length - 1]; index++) {
                            let item = {
                                operation: criteriasWrapper.rulesMap.hasOwnProperty(index) ? criteriasWrapper.rulesMap[index].operation : '',
                                fieldName: criteriasWrapper.rulesMap.hasOwnProperty(index) ? criteriasWrapper.rulesMap[index].fieldName : '',
                                value: criteriasWrapper.rulesMap.hasOwnProperty(index) ? criteriasWrapper.rulesMap[index].value : '',
                                get isBlankOrIsNull() { return this.operation == Operations.ISNULL || this.operation == Operations.ISBLANK },
                                get valueType() {
                                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                                        if (fieldsMap[this.fieldName].isNumber) {
                                            return 'number';
                                        } else if (fieldsMap[this.fieldName].isBoolean) {
                                            return 'checkbox';
                                        } else if (fieldsMap[this.fieldName].isDate) {
                                            return 'date';
                                        } else if (fieldsMap[this.fieldName].isDateTime) {
                                            return 'datetime';
                                        } else if (fieldsMap[this.fieldName].isTime) {
                                            return 'time';
                                        }
                                    }
                                    return 'text';
                                },
                                get operationOptions() {
                                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                                        return getFieldOperationByType(fieldsMap[this.fieldName]);
                                    }
                                    return [{ label: Labels.LBL_None, value: '' }];
                                },
                                get showpicklistvalues() {
                                    let picklistvalues = this.picklistvalues;
                                    return picklistvalues && picklistvalues.length;
                                },
                                get picklistvalues() {
                                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                                        if (fieldsMap[this.fieldName].isBoolean) {
                                            return [
                                                { label: Labels.LBL_True, value: 'true' },
                                                { label: Labels.LBL_False, value: 'false' },
                                            ];
                                        }
                                        return fieldsMap[this.fieldName].pickListValues || undefined;
                                    }
                                    return undefined;
                                },
                                index: index
                            };
                            criterias.push(item);
                        }
                    }
                }
                this.criterias = criterias;
                this.expression = criteriasWrapper.expression || criterias.map(item => item.index).join(' AND ');
            }
        } catch (error) {
            console.log(error);
        }
        this.addDefaultRule();
        setTimeout(() => {
            self.Loading = false;
        }, 200);
    }
    addDefaultRule() {
        let fieldsMap = this.fieldsMap;
        let criterias = this.criterias || [];
        if (criterias && !criterias.length) {
            if (!this.expression || !this.expression.trim()) {
                this.expression = 1;
            }
            let item = {
                operation: '',
                fieldName: '',
                value: '',
                get isBlankOrIsNull() { return this.operation == Operations.ISNULL || this.operation == Operations.ISBLANK },
                get valueType() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        if (fieldsMap[this.fieldName].isNumber) {
                            return 'number';
                        } else if (fieldsMap[this.fieldName].isBoolean) {
                            return 'checkbox';
                        } else if (fieldsMap[this.fieldName].isDate) {
                            return 'date';
                        } else if (fieldsMap[this.fieldName].isDateTime) {
                            return 'datetime';
                        } else if (fieldsMap[this.fieldName].isTime) {
                            return 'time';
                        }
                    }
                    return 'text';
                },
                get operationOptions() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        return getFieldOperationByType(fieldsMap[this.fieldName]);
                    }
                    return [{ label: Labels.LBL_None, value: '' }];
                },
                get showpicklistvalues() {
                    let picklistvalues = this.picklistvalues;
                    return picklistvalues && picklistvalues.length;
                },
                get picklistvalues() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        if (fieldsMap[this.fieldName].isBoolean) {
                            return [
                                { label: Labels.LBL_True, value: 'true' },
                                { label: Labels.LBL_False, value: 'false' },
                            ];
                        }
                        return fieldsMap[this.fieldName].pickListValues || undefined;
                    }
                    return undefined;
                },
                index: 1
            };
            criterias.push(item);
            this.criterias = criterias.map(item => item);
        }
    }
    handleExpressionChange(event) {
        let value = event.detail.value;
        this.expression = value;
        this.notifyParent();
    }
    checkExpressionValidity() {
        var inputCmp = this.template.querySelector('.expressionInput');
        let evalResult = evaluateExpression(this.expression, this.criterias.filter(item => item.fieldName && item.operation).map(item => item.index));
        if (inputCmp) {
            this.hasError = !evalResult.isSuccess;
            if (evalResult.error) {
                inputCmp.setCustomValidity(evalResult.error + (evalResult.expression ? " : " + evalResult.expression : ''));
            } else {
                inputCmp.setCustomValidity("");
            }
            inputCmp.reportValidity();
        }
    }
    deleteCriteriaHandler(event) {
        try {
            let elementIndex = event.target.dataset.index - 1;
            if (elementIndex != 0) {
                // let index = 0;
                this.criterias.splice(elementIndex, 1);
            } else {
                if (this.criterias.length > 0) {
                    this.criterias[0].operation = '';
                    this.criterias[0].fieldName = '';
                    this.criterias[0].value = '';
                }
            }
            let counter = 1;
            this.criterias = this.criterias.map(item => { item.index = counter++; return item; });
            this.addDefaultRule();
            this.notifyParent();
        } catch (error) {
            console.log(error);
        }
    }
    handleFieldChange(event) {
        try {
            let elementIndex = event.target.dataset.index - 1;
            let value = event.detail.value;
            this.criterias[elementIndex].fieldName = value;
            this.criterias = this.criterias.map(item => item);
            this.notifyParent();
        } catch (error) {
            console.log(error);
        }
    }
    handleOperationChange(event) {
        try {
            let elementIndex = event.target.dataset.index - 1;
            let value = event.detail.value;
            this.criterias[elementIndex].operation = value;
            this.criterias = this.criterias.map(item => item);
            this.notifyParent();
        } catch (error) {
            console.log(error);
        }
    }
    handleValuechange(event) {
        try {
            let elementIndex = event.target.dataset.index - 1;
            let value = event.detail.value;
            this.criterias[elementIndex].value = value;
            this.criterias = this.criterias.map(item => item);
            this.notifyParent();
        } catch (error) {
            console.log(error);
        }
    }
    addCriteriaHandler() {
        try {
            let fieldsMap = this.fieldsMap;
            let newIndex = this.criterias.length;
            let criteria = {
                fieldName: '',
                operation: '',
                value: '',
                get isBlankOrIsNull() { return this.operation == Operations.ISNULL || this.operation == Operations.ISBLANK },
                get valueType() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        if (fieldsMap[this.fieldName].isNumber) {
                            return 'number';
                        } else if (fieldsMap[this.fieldName].isBoolean) {
                            return 'checkbox';
                        } else if (fieldsMap[this.fieldName].isDate) {
                            return 'date';
                        } else if (fieldsMap[this.fieldName].isDateTime) {
                            return 'datetime';
                        } else if (fieldsMap[this.fieldName].isTime) {
                            return 'time';
                        }
                    }
                    return 'text';
                },
                get operationOptions() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        return getFieldOperationByType(fieldsMap[this.fieldName]);
                    }
                    return [{ label: Labels.LBL_None, value: '' }];
                },
                get showpicklistvalues() {
                    let picklistvalues = this.picklistvalues;
                    return picklistvalues && picklistvalues.length;
                },
                get picklistvalues() {
                    if (fieldsMap.hasOwnProperty(this.fieldName)) {
                        if (fieldsMap[this.fieldName].isBoolean) {
                            return [
                                { label: Labels.LBL_True, value: 'true' },
                                { label: Labels.LBL_False, value: 'false' },
                            ];
                        }
                        return fieldsMap[this.fieldName].pickListValues || undefined;
                    }
                    return undefined;
                },
                index: newIndex + 1
            };
            if (this.expression) {
                let matched = this.expression.match ? this.expression.match(new RegExp('[0-9]+', 'gi')) : [];
                if (!matched || !matched.includes('' + (newIndex + 1))) {
                    this.expression += ' AND ' + (newIndex + 1);
                }
            }
            let criterias = this.criterias.map(item => item);
            criterias.push(criteria);
            this.criterias = criterias;
            this.notifyParent();
        } catch (error) {
            console.log(error);
        }
    }
    notifyParent() {
        this.checkExpressionValidity();
        let criterias = {};
        let criteriasMap = this.criteriasMap;
        let hasError = this.hasError;
        let expression = this.expression;
        Object.keys(criteriasMap).filter(key => criteriasMap[key] && criteriasMap[key].fieldName).forEach(key => criterias[key] = { fieldName: criteriasMap[key].fieldName, operation: criteriasMap[key].operation, value: criteriasMap[key].value, });
        let value = JSON.stringify({ expression: expression, rulesMap: criterias });
        const confirmEvent = new CustomEvent(this.confirmEvent, { detail: { value: value, hasError: hasError, }, });
        this.dispatchEvent(confirmEvent);
    }
}