<?php

namespace App\Http\Controllers;

use App\Models\AccountingCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AccountingDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : Carbon::now()->startOfYear();

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : Carbon::now()->endOfDay();

        $categoryId = $request->filled('category_id') ? (int) $request->input('category_id') : null;

        // KPI query — respects date + category filters
        $kpiQuery = Transaction::with('category')
            ->whereBetween('date', [$from, $to]);

        if ($categoryId) {
            $kpiQuery->where('accounting_category_id', $categoryId);
        }

        $transactions = $kpiQuery->latest('date')->get();

        $totalIncome  = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $balance      = $totalIncome - $totalExpense;

        // Monthly breakdown for the filtered period
        $monthly = $this->buildMonthlyBreakdown($from, $to, $categoryId);

        // Last 10 transactions — respects category filter
        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $recentModels */
        $recentQuery = Transaction::with('category')->latest('date');

        if ($categoryId) {
            $recentQuery->where('accounting_category_id', $categoryId);
        }

        $recentModels = $recentQuery->take(10)->get();
        $recent = $recentModels->map(fn (Transaction $t) => $this->formatTransaction($t));

        return Inertia::render('accounting/dashboard', [
            'kpis' => [
                'income'            => (float) $totalIncome,
                'expense'           => (float) $totalExpense,
                'balance'           => (float) $balance,
                'transaction_count' => $transactions->count(),
            ],
            'monthly'    => $monthly,
            'recent'     => $recent,
            'categories' => AccountingCategory::orderBy('type')->orderBy('name')->get(['id', 'name', 'type', 'color']),
            'filters'    => [
                'from'        => $from->toDateString(),
                'to'          => $to->toDateString(),
                'category_id' => $categoryId,
            ],
        ]);
    }

    private function buildMonthlyBreakdown(Carbon $from, Carbon $to, ?int $categoryId = null): array
    {
        $query = Transaction::selectRaw('
                YEAR(date)  as year,
                MONTH(date) as month,
                type,
                SUM(amount) as total
            ')
            ->whereBetween('date', [$from, $to]);

        if ($categoryId) {
            $query->where('accounting_category_id', $categoryId);
        }

        $rows = $query
            ->groupBy('year', 'month', 'type')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Build a keyed map month → {income, expense}
        $map = [];
        foreach ($rows as $row) {
            $key = $row->year . '-' . str_pad($row->month, 2, '0', STR_PAD_LEFT);
            if (!isset($map[$key])) {
                $map[$key] = ['month' => $key, 'income' => 0.0, 'expense' => 0.0, 'balance' => 0.0];
            }
            $map[$key][$row->type] = (float) $row->total;
        }

        // Recalculate balance for each month
        foreach ($map as &$row) {
            $row['balance'] = $row['income'] - $row['expense'];
        }

        return array_values($map);
    }

    private function formatTransaction(Transaction $t): array
    {
        return [
            'id'          => $t->id,
            'type'        => $t->type,
            'amount'      => (float) $t->amount,
            'description' => $t->description,
            'date'        => $t->date->format('Y-m-d'),
            'category'    => $t->category ? ['name' => $t->category->name, 'color' => $t->category->color] : null,
        ];
    }
}
