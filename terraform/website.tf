# terraform/frontend.tf

resource "aws_s3_bucket" "website_s3_bucket" {
  bucket = var.website_s3_bucket_name

  tags = {
    "jt:my-personal-system:name" = "website-s3-bucket"
    "jt:my-personal-system:description" = "S3 Bucket for hosting website static assets"
    "jt:my-personal-system:module" = "frontend"
    "jt:my-personal-system:component" = "website-s3-bucket"
  }
}

# Block ALL public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "website_access_block" {
  bucket = aws_s3_bucket.website_s3_bucket.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# Create the CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "website_oac" {
  name                              = "website_oac"
  description                       = "Origin Access Control for the personal system S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "no_cache_headers" {
  name    = "NoCacheHeadersPolicy-PersonalSystem"
  comment = "Adds no-cache headers for index.html"

  custom_headers_config {
    items {
      header   = "Cache-Control"
      override = true
      value    = "no-store, no-cache, must-revalidate, max-age=0"
    }
    items {
      header   = "Pragma"
      override = true
      value    = "no-cache"
    }
    items {
      header = "Expires"
      override = true
      value = "0"
    }
  }
}

resource "aws_cloudfront_distribution" "website_cloudformation_distribution" {
  origin {
    origin_id                = aws_s3_bucket.website_s3_bucket.id
    domain_name              = aws_s3_bucket.website_s3_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.website_oac.id
  }

  enabled             = true
  default_root_object = "index.html"
  aliases = ["${var.website_subdomain_name}.${var.domain_name}"]
  web_acl_id = aws_wafv2_web_acl.website_waf.arn
  price_class = "PriceClass_100"  

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["CA"]
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.site_cert_validation.certificate_arn
    ssl_support_method  = "sni-only"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.website_s3_bucket.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern     = "index.html"
    target_origin_id = aws_s3_bucket.website_s3_bucket.id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    cache_policy_id  = data.aws_cloudfront_cache_policy.caching_disabled.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.no_cache_headers.id
  }

  tags = {
    Name = "website-cloudfront-distribution"
    "jt:my-personal-system:name" = "website-cloudfront-distribution"
    "jt:my-personal-system:description" = "Public access to the website"
    "jt:my-personal-system:module" = "frontend"
    "jt:my-personal-system:component" = "cloud-front-distribution"
  }
}

# Lock down access to the website S3 bucket to the CloudFront distribution
resource "aws_s3_bucket_policy" "website_s3_bucket_policy" {
  bucket = aws_s3_bucket.website_s3_bucket.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "s3:GetObject",
      Effect    = "Allow",
      Principal = {
        Service = "cloudfront.amazonaws.com"
      },
      Resource  = "${aws_s3_bucket.website_s3_bucket.arn}/*",
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.website_cloudformation_distribution.arn
        }
      }
    }]
  })

  # Grant CloudFront Distribution access after website S3 bucket is blocked from public acccess
  depends_on = [aws_s3_bucket_public_access_block.website_access_block]
}
