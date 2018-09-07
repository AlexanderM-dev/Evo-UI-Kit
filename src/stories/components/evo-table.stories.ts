import { storiesOf, moduleMetadata } from '@storybook/angular';
import { EvoUiKitModule } from 'evo-ui-kit';

const data = [
    {
        bank: 'Модульбанк',
        amount: 'до 100 000 ₽',
        period: '24 мес.',
        percent: '12 %',
        delay: '1 день',
        button: 'Кнопка 1',
    },
    {
        bank: 'Промсвязьбанк',
        amount: 'до 300 000 ₽',
        period: 'до 12 мес.',
        percent: '13 %',
        delay: '1–3 дня',
        button: 'Кнопка 2',
    },
    {
        bank: 'Сбербанк',
        amount: 'до 500 000 ₽',
        period: 'до 24 мес.',
        percent: '14 %',
        delay: '2–4 дня',
        button: 'Кнопка 3',
    },
];

storiesOf('Components/Table', module)
    .addDecorator(
        moduleMetadata({
            imports: [
                EvoUiKitModule,
            ],
        }),
    )
    .add('default', () => ({
        template: `
        <evo-table [data]=data stripe=true>
            <evo-table-column prop="bank" label="Банк"></evo-table-column>
            <evo-table-column prop="amount" label="Сумма"></evo-table-column>
            <evo-table-column prop="period" label="Срок"></evo-table-column>
            <evo-table-column prop="percent" label="Процент"></evo-table-column>
            <evo-table-column prop="delay" label="Получение денег"></evo-table-column>
            <evo-table-column>
                <ng-template #content let-row="row" let-col="col">
                    <evo-button size="small" color="lined">{{ data[row].button }}</evo-button>
                </ng-template>
            </evo-table-column>
        </evo-table>
        `,
        props: {
            data,
        },
    }))
    .add('with formatter', () => ({
        template: `
        <evo-table [data]=data stripe=true>
            <evo-table-column prop="bank" label="Банк" [formatter]="formatter"></evo-table-column>
            <evo-table-column prop="amount" label="Сумма"></evo-table-column>
            <evo-table-column prop="period" label="Срок"></evo-table-column>
            <evo-table-column prop="percent" label="Процент"></evo-table-column>
            <evo-table-column prop="delay" label="Получение денег"></evo-table-column>
            <evo-table-column>
                <ng-template #content let-row="row" let-col="col">
                    <evo-button size="small" color="lined">{{ data[row].button }}</evo-button>
                </ng-template>
            </evo-table-column>
        </evo-table>
        `,
        props: {
            data,
            formatter: (row, col, cellValue) => `Formatted!${cellValue}`,
        },
    }))
    .add('without props', () => ({
        template: `
        <evo-table [data]=data stripe=true>
            <evo-table-column prop="bank" label="Банк"></evo-table-column>
            <evo-table-column label="Условия" [formatter]="formatter"></evo-table-column>
            <evo-table-column prop="delay" label="Получение денег"></evo-table-column>
            <evo-table-column>
                <ng-template #content let-row="row" let-col="col">
                    <evo-button size="small" color="lined">{{ data[row].button }}</evo-button>
                </ng-template>
            </evo-table-column>
        </evo-table>
        `,
        props: {
            data,
            formatter: (row, col, cellValue) => `${cellValue.amount} на ${cellValue.period} под ${cellValue.percent}`,
        },
    }));