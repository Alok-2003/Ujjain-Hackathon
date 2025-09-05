import React from 'react';

type Status = 'Pending' | 'In Progress' | 'Completed';

type Worker = {
  id: string;
  name: string;
  phone: string;
  task: string;
  eta: string; // human-readable estimated time
  status: Status;
};

const WorkerManage: React.FC = () => {
  const [workers, setWorkers] = React.useState<Worker[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  // Form state
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [task, setTask] = React.useState('');
  const [eta, setEta] = React.useState('');
  const [status, setStatus] = React.useState<Status>('Pending');

  const resetForm = () => {
    setName('');
    setPhone('');
    setTask('');
    setEta('');
    setStatus('Pending');
  };

  const addWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !task.trim() || !eta.trim()) return;
    const id = Math.random().toString(36).slice(2);
    const w: Worker = { id, name: name.trim(), phone: phone.trim(), task: task.trim(), eta: eta.trim(), status };
    setWorkers((prev) => [w, ...prev]);
    resetForm();
    setIsOpen(false);
  };

  const removeWorker = (id: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== id));
  };

  const updateStatus = (id: string, newStatus: Status) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Worker Management</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-500"
        >
          Add Worker
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No workers added yet.
                </td>
              </tr>
            ) : (
              workers.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{w.name}</td>
                  <td className="px-4 py-2">
                    <a href={`tel:${w.phone}`} className="text-blue-600 hover:underline">{w.phone}</a>
                  </td>
                  <td className="px-4 py-2">{w.task}</td>
                  <td className="px-4 py-2">{w.eta}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        'inline-flex items-center rounded px-2 py-1 text-xs font-medium ' +
                        (w.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : w.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800')
                      }
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <select
                      value={w.status}
                      onChange={(e) => updateStatus(w.id, e.target.value as Status)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => removeWorker(w.id)}
                      className="px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Worker Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Add Worker</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={addWorker} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Worker Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone No.</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="9876543210"
                  pattern="^[0-9()+\-\s]{7,}$"
                  title="Enter a valid phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Assigned</label>
                <input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="e.g., Crowd control at Gate 3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                  <input
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="e.g., 2 hours"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="mt-1 w-full border rounded px-3 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManage;