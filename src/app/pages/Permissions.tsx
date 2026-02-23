import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Save } from 'lucide-react';

const modules = [
  'Projects',
  'Tasks',
  'Issues',
  'Time Log',
  'Reports',
  'Users',
  'Teams',
  'Roles',
  'Automation',
  'Settings',
];

const roles = [
  'Administrator',
  'Project Manager',
  'Developer',
  'Designer',
  'QA Engineer',
  'Viewer',
];

const permissions = {
  Projects: { Administrator: ['view', 'create', 'edit', 'delete'], 'Project Manager': ['view', 'create', 'edit'], Developer: ['view'], Designer: ['view'], 'QA Engineer': ['view'], Viewer: ['view'] },
  Tasks: { Administrator: ['view', 'create', 'edit', 'delete'], 'Project Manager': ['view', 'create', 'edit', 'delete'], Developer: ['view', 'create', 'edit'], Designer: ['view', 'create', 'edit'], 'QA Engineer': ['view', 'edit'], Viewer: ['view'] },
  Issues: { Administrator: ['view', 'create', 'edit', 'delete'], 'Project Manager': ['view', 'create', 'edit', 'delete'], Developer: ['view', 'create', 'edit'], Designer: ['view', 'create', 'edit'], 'QA Engineer': ['view', 'create', 'edit'], Viewer: ['view'] },
};

export function Permissions() {
  return (
    <PageLayout 
      title="Permissions Matrix"
      actions={
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      }
    >
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="sticky left-0 bg-[#F8FAFC] px-4 py-3 text-left text-[14px] font-semibold text-[#1F2937] w-48">
                  Module
                </th>
                {roles.map((role) => (
                  <th key={role} className="px-4 py-3 text-center text-[14px] font-semibold text-[#1F2937] min-w-[120px]">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module, moduleIndex) => (
                <tr key={module} className={`border-b border-[#E5E7EB] ${moduleIndex % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className="sticky left-0 px-4 py-4 text-[14px] font-medium text-[#1F2937] bg-inherit">
                    {module}
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="px-4 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              defaultChecked={true}
                              className="w-4 h-4 rounded border-[#E5E7EB]"
                            />
                            <span className="text-[12px] text-[#6B7280]">View</span>
                          </label>
                        </div>
                        {role !== 'Viewer' && (
                          <div className="flex gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                defaultChecked={role === 'Administrator' || role === 'Project Manager'}
                                className="w-4 h-4 rounded border-[#E5E7EB]"
                              />
                              <span className="text-[12px] text-[#6B7280]">Edit</span>
                            </label>
                          </div>
                        )}
                        {(role === 'Administrator' || role === 'Project Manager') && (
                          <div className="flex gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                defaultChecked={role === 'Administrator'}
                                className="w-4 h-4 rounded border-[#E5E7EB]"
                              />
                              <span className="text-[12px] text-[#6B7280]">Delete</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}
