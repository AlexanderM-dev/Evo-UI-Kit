import { FormsModule } from '@angular/forms';
import { storiesOf, moduleMetadata } from '@storybook/angular';
import { EvoUiKitModule } from 'evo-ui-kit';

const optionsList = [
    {
        label: 'Все',
        value: 'all',
        counter: 14,
    },
    {
        label: 'Поддержка',
        value: 'support',
        counter: 12,
    },
    {
        label: 'Оплата',
        value: 'payment',
        counter: 2,
    },
];

let selectedFilterValue: string = optionsList[0].value;

storiesOf('Components/RadioGroup', module)
    .addDecorator(
        moduleMetadata({
            imports: [
                FormsModule,
                EvoUiKitModule,
            ],
        }),
    )
    .add('default', () => ({
        template: `
        <evo-segmented-bar
            label="Длинный заголовок:"
        >
            <evo-segmented-bar-button
                *ngFor="let option of optionsList"
                name="filterList"
                [value]="option.value"
                [(ngModel)]="selectedFilterValue"
            >
                {{ option.label }}
            </evo-segmented-bar-button>
        </evo-segmented-bar>
        `,
        props: {
            optionsList,
            selectedFilterValue,
        },
    }))
    .add('with dynamic label', () => ({
        template: `
        <evo-segmented-bar
            label="Длинный заголовок:"
            labelShort="Заголовок:"
        >
            <evo-segmented-bar-button
                *ngFor="let option of optionsList"
                name="filterList"
                [value]="option.value"
                [(ngModel)]="selectedFilterValue"
            >
                {{ option.label }}
            </evo-segmented-bar-button>
        </evo-segmented-bar>
        `,
        props: {
            optionsList,
            selectedFilterValue,
        },
    }))
    .add('with counter', () => ({
        template: `
        <evo-segmented-bar
            label="Длинный заголовок:"
        >
            <evo-segmented-bar-button
                *ngFor="let option of optionsList"
                name="filterList"
                [value]="option.value"
                [(ngModel)]="selectedFilterValue"
            >
                <span>{{ option.label }}</span>
                <span data-type="counter" *ngIf="option.counter">{{ option.counter }}</span>
            </evo-segmented-bar-button>
        </evo-segmented-bar>
        `,
        props: {
            optionsList,
            selectedFilterValue,
        },
    }));
