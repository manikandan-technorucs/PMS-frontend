import React from 'react';
import { Card } from '@/components/layout/Card';
import { FormField } from '@/components/forms/FormField';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/forms/Button';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Controller, useFieldArray, Control, UseFormRegister, UseFormSetValue, useWatch } from 'react-hook-form';

export interface WeeklyMatrixFormProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  days: Date[];
  onDateShift: (direction: 'prev' | 'next') => void;
  errors: any;
}

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function WeeklyMatrixForm({ control, register, setValue, days, onDateShift, errors }: WeeklyMatrixFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'logs',
  });

  const formValues = useWatch({ control, name: 'logs' }) || [];

  const getDayTotal = (dayIndex: number) => {
    return formValues.reduce((sum: number, row: any) => sum + Number(row?.hours?.[dayIndex] || 0), 0);
  };

  const getRowTotal = (rowIndex: number) => {
    return (formValues[rowIndex]?.hours || []).reduce((sum: number, h: number) => sum + Number(h || 0), 0);
  };

  const grandTotal = formValues.reduce((sum: number, row: any) => {
    return sum + (row?.hours || []).reduce((rowSum: number, h: number) => rowSum + Number(h || 0), 0);
  }, 0);

  return (
    <div className="space-y-4 max-w-[1400px]">
      <div className="bg-theme-surface/70 backdrop-blur-xl border border-theme-border/50 rounded-2xl p-4 flex justify-center shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onDateShift('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-6 py-2 bg-theme-neutral/50 rounded-xl font-bold text-theme-primary min-w-[300px] text-center flex justify-center items-center gap-2">
            <CalendarIcon size={16} className="text-brand-teal-500" />
            {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
            {days[days.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Button variant="secondary" onClick={() => onDateShift('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto p-4 custom-scrollbar">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Project</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[20%]">Task / Bug</th>
                {days.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th key={i} className={`text-center py-3 px-2 text-[10px] uppercase min-w-[60px] ${isWeekend ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                      <div className="flex flex-col gap-0.5">
                        <span className={isWeekend ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400 font-bold'}>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold text-[12px]">
                          {d.getDate()}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="w-[80px] text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                <th className="w-16 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Act</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 align-top">
                    <FormField label="" error={errors.logs?.[index]?.project_id?.message}>
                      <Controller
                        name={`logs.${index}.project`}
                        control={control}
                        render={({ field: dField }) => (
                          <ServerSearchDropdown
                            entityType="projects"
                            placeholder="Select Project"
                            value={dField.value}
                            onChange={(v) => {
                              dField.onChange(v);
                              setValue(`logs.${index}.task`, null);
                            }}
                            className="w-full"
                          />
                        )}
                      />
                    </FormField>
                  </td>
                  <td className="p-2 align-top">
                    <Controller
                      name={`logs.${index}.project`}
                      control={control}
                      render={({ field: pField }) => {
                        const projectId = extractId(pField.value);
                        return (
                          <FormField label="" error={errors.logs?.[index]?.task_id?.message}>
                            <Controller
                              name={`logs.${index}.task`}
                              control={control}
                              render={({ field: tField }) => (
                                <ServerSearchDropdown
                                  entityType="workitems"
                                  endpoint="/search/work-items"
                                  field="name"
                                  project_id={projectId}
                                  placeholder="Select Task..."
                                  value={tField.value}
                                  onChange={tField.onChange}
                                  disabled={!projectId}
                                  className="w-full"
                                />
                              )}
                            />
                          </FormField>
                        );
                      }}
                    />
                  </td>
                  {days.map((_, dayIndex) => {
                     const isWeekend = days[dayIndex].getDay() === 0 || days[dayIndex].getDay() === 6;
                     return (
                        <td key={dayIndex} className={`p-2 align-middle ${isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}>
                          <FormField label="" error={errors.logs?.[index]?.hours?.[dayIndex]?.message}>
                            <TextInput
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              {...register(`logs.${index}.hours.${dayIndex}`)}
                              className="w-[50px] text-center mx-auto text-sm font-black h-9 border-transparent hover:border-brand-teal-300 focus:border-brand-teal-500 bg-white dark:bg-slate-900 shadow-sm"
                              placeholder="0"
                            />
                          </FormField>
                        </td>
                     );
                  })}
                  <td className="p-3 align-middle text-center">
                    <div className="font-bold text-[14px] text-slate-700 dark:text-slate-300">
                      {getRowTotal(index).toFixed(1)}h
                    </div>
                  </td>
                  <td className="p-3 align-top text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-1"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td colSpan={2} className="p-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider">
                  Total Hours
                </td>
                {days.map((_, i) => (
                  <td key={i} className="p-3 text-center">
                    <span className="font-black text-[13px] text-brand-teal-600">
                      {getDayTotal(i).toFixed(1)}h
                    </span>
                  </td>
                ))}
                <td className="p-3 text-center">
                  <div className="font-black text-[14px] bg-brand-teal-100 dark:bg-brand-teal-900/40 text-brand-teal-700 dark:text-brand-teal-400 px-2 py-1 rounded-lg">
                    {grandTotal.toFixed(1)}h
                  </div>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-start">
          <Button
            variant="secondary"
            onClick={() => append({ project: null, task: null, hours: Array(days.length).fill(0) })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Row
          </Button>
        </div>
      </Card>
    </div>
  );
}
