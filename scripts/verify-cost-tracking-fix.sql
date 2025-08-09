-- SQL queries to verify the OpenRouter cost tracking fix
-- Run these queries against your Neon database to check the implementation

-- 1. Check recent OpenRouter records with generation ID metadata
SELECT 
    id,
    model_id,
    provider,
    input_tokens,
    output_tokens,
    estimated_cost,
    actual_cost,
    CASE 
        WHEN estimated_cost = actual_cost THEN 'SAME'
        WHEN actual_cost IS NULL THEN 'NULL_ACTUAL'
        ELSE 'DIFFERENT'
    END as cost_comparison,
    metadata->>'generationId' as generation_id,
    metadata->'openRouterFetch'->>'attempted' as fetch_attempted,
    metadata->'openRouterFetch'->>'successful' as fetch_successful,
    metadata->'openRouterFetch'->>'hasActualCost' as has_actual_cost,
    created_at
FROM token_usage_metrics 
WHERE provider = 'openrouter' 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Count records by cost comparison status
SELECT 
    provider,
    CASE 
        WHEN estimated_cost = actual_cost THEN 'COSTS_IDENTICAL'
        WHEN actual_cost IS NULL THEN 'ACTUAL_COST_NULL'
        WHEN estimated_cost != actual_cost THEN 'COSTS_DIFFERENT'
        ELSE 'OTHER'
    END as cost_status,
    COUNT(*) as record_count,
    AVG(CAST(estimated_cost AS DECIMAL)) as avg_estimated_cost,
    AVG(CAST(actual_cost AS DECIMAL)) as avg_actual_cost
FROM token_usage_metrics 
WHERE provider = 'openrouter'
    AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY provider, cost_status
ORDER BY record_count DESC;

-- 3. Check for generation IDs in metadata
SELECT 
    COUNT(*) as total_openrouter_records,
    COUNT(CASE WHEN metadata->>'generationId' IS NOT NULL THEN 1 END) as records_with_generation_id,
    COUNT(CASE WHEN metadata->'openRouterFetch'->>'attempted' = 'true' THEN 1 END) as fetch_attempted_count,
    COUNT(CASE WHEN metadata->'openRouterFetch'->>'successful' = 'true' THEN 1 END) as fetch_successful_count,
    ROUND(
        100.0 * COUNT(CASE WHEN metadata->>'generationId' IS NOT NULL THEN 1 END) / COUNT(*), 
        2
    ) as generation_id_percentage
FROM token_usage_metrics 
WHERE provider = 'openrouter'
    AND created_at >= NOW() - INTERVAL '24 hours';

-- 4. Show sample of enhanced metadata
SELECT 
    id,
    model_id,
    estimated_cost,
    actual_cost,
    jsonb_pretty(metadata) as formatted_metadata,
    created_at
FROM token_usage_metrics 
WHERE provider = 'openrouter' 
    AND metadata->>'generationId' IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Check for cost discrepancies (where actual != estimated)
SELECT 
    id,
    model_id,
    input_tokens,
    output_tokens,
    estimated_cost,
    actual_cost,
    ROUND(
        CAST(actual_cost AS DECIMAL) - CAST(estimated_cost AS DECIMAL), 
        6
    ) as cost_difference,
    ROUND(
        100.0 * (CAST(actual_cost AS DECIMAL) - CAST(estimated_cost AS DECIMAL)) / CAST(estimated_cost AS DECIMAL), 
        2
    ) as cost_difference_percentage,
    metadata->>'generationId' as generation_id,
    created_at
FROM token_usage_metrics 
WHERE provider = 'openrouter'
    AND actual_cost IS NOT NULL 
    AND estimated_cost != actual_cost
ORDER BY ABS(CAST(actual_cost AS DECIMAL) - CAST(estimated_cost AS DECIMAL)) DESC
LIMIT 10;

-- 6. Daily summary of cost tracking accuracy
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_records,
    COUNT(CASE WHEN metadata->>'generationId' IS NOT NULL THEN 1 END) as with_generation_id,
    COUNT(CASE WHEN actual_cost IS NOT NULL AND estimated_cost != actual_cost THEN 1 END) as actual_costs_different,
    AVG(CAST(estimated_cost AS DECIMAL)) as avg_estimated,
    AVG(CAST(actual_cost AS DECIMAL)) as avg_actual,
    SUM(CAST(estimated_cost AS DECIMAL)) as total_estimated,
    SUM(CAST(actual_cost AS DECIMAL)) as total_actual
FROM token_usage_metrics 
WHERE provider = 'openrouter'
    AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;