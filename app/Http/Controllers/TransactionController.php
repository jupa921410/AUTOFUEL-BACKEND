<?php

namespace App\Http\Controllers;

use App\Models\AccountingCategory;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::with('category')->latest('date');

        if ($request->filled('from')) {
            $query->where('date', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->where('date', '<=', $request->input('to'));
        }
        if ($request->filled('type') && in_array($request->input('type'), ['income', 'expense'])) {
            $query->where('type', $request->input('type'));
        }

        $transactions = $query->get();

        $totalIncome  = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');

        return Inertia::render('transactions/index', [
            'transactions'   => $transactions,
            'categories'     => AccountingCategory::orderBy('type')->orderBy('name')->get(),
            'filters'        => $request->only(['from', 'to', 'type']),
            'totals'         => [
                'income'  => (float) $totalIncome,
                'expense' => (float) $totalExpense,
                'balance' => (float) ($totalIncome - $totalExpense),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'accounting_category_id' => ['nullable', 'exists:accounting_categories,id'],
            'type'                   => ['required', 'in:income,expense'],
            'amount'                 => ['required', 'numeric', 'min:0.01'],
            'description'            => ['nullable', 'string', 'max:255'],
            'date'                   => ['required', 'date'],
            'notes'                  => ['nullable', 'string'],
        ]);

        Transaction::create($validated);

        return back()->with('success', 'Transaction recorded.');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'accounting_category_id' => ['nullable', 'exists:accounting_categories,id'],
            'type'                   => ['required', 'in:income,expense'],
            'amount'                 => ['required', 'numeric', 'min:0.01'],
            'description'            => ['nullable', 'string', 'max:255'],
            'date'                   => ['required', 'date'],
            'notes'                  => ['nullable', 'string'],
        ]);

        $transaction->update($validated);

        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return back()->with('success', 'Transaction deleted.');
    }
}
