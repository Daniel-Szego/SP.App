#----------------------------------------------------------------------------- 
# Filename : spps.solutions.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Contains methods to manage solutions

function Add-Solution
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$path
	)
	
	Write-Host "Uploading solution $path" -foregroundcolor black -backgroundcolor yellow
	
	$file = Get-Item -Path $path
	
	$targetPath = Join-Parts -Separator '/' -Parts $Spps.Site.ServerRelativeUrl, "/_catalogs/solutions/", $file.Name
	
    $fs = $file.OpenRead()
    try {
		[Microsoft.SharePoint.Client.File]::SaveBinaryDirect($Spps, $targetPath, $fs, $true)
		Write-Host "Solution succesfully uploaded" -foregroundcolor black -backgroundcolor green
	}
	catch
	{
		Write-Host "Solution $($file.Name) already exists" -foregroundcolor black -backgroundcolor yellow
	}
    $fs.Close()
	
	
}

function Get-SolutionId
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$solutionName
	)
	
	$fileUrl = Join-Parts -Separator '/' -Parts $Spps.Site.ServerRelativeUrl, "/_catalogs/solutions/", $solutionName
	
    $solution = $Spps.Site.RootWeb.GetFileByServerRelativeUrl($fileUrl)
    $Spps.Load($solution.ListitemAllFields)
	$Spps.ExecuteQuery()

    return $solution.ListItemAllFields.Id
}

function Switch-EnableDisableSolution
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$solutionName,
		
		[Parameter(Mandatory=$true, Position=2)]
	    [bool]$activate
	)
	
	
	$solutionId = Get-SolutionId -solutionName $solutionName

    # Queries the solution's page
    $operation = ""
	if($activate) 
	{ 
		$operation = "ACT" 
	} 
	else 
	{ 
		$operation = "DEA" 
	}
	
    $solutionPageUrl = Join-Parts -Separator '/' -Parts $Spps.Site.Url, "/_catalogs/solutions/forms/activate.aspx?Op=$operation&ID=$solutionId"
	
	$cookieContainer = New-Object System.Net.CookieContainer
    
	$request = $Spps.WebRequestExecutorFactory.CreateWebRequestExecutor($Spps, $solutionPageUrl).WebRequest
	
	if ($Spps.Credentials -ne $null)
	{
		$authCookieValue = $Spps.Credentials.GetAuthenticationCookie($Spps.Url)
	    # Create fed auth Cookie
	  	$fedAuth = new-object System.Net.Cookie
		$fedAuth.Name = "FedAuth"
	  	$fedAuth.Value = $authCookieValue.TrimStart("SPOIDCRL=")
	  	$fedAuth.Path = "/"
	  	$fedAuth.Secure = $true
	  	$fedAuth.HttpOnly = $true
	  	$fedAuth.Domain = (New-Object System.Uri($Spps.Url)).Host
	  	
		# Hookup authentication cookie to request
		$cookieContainer.Add($fedAuth)
		
		$request.CookieContainer = $cookieContainer
	}
	else
	{
		# No specific authentication required
		$request.UseDefaultCredentials = $true
	}
	
	$request.ContentLength = 0
	
	$response = $request.GetResponse()
	
		# decode response
		$strResponse = $null
		$stream = $response.GetResponseStream()
		if (-not([String]::IsNullOrEmpty($response.Headers["Content-Encoding"])))
		{
        	if ($response.Headers["Content-Encoding"].ToLower().Contains("gzip"))
			{
                $stream = New-Object System.IO.Compression.GZipStream($stream, [System.IO.Compression.CompressionMode]::Decompress)
			}
			elseif ($response.Headers["Content-Encoding"].ToLower().Contains("deflate"))
			{
                $stream = new-Object System.IO.Compression.DeflateStream($stream, [System.IO.Compression.CompressionMode]::Decompress)
			}
		}
		
		# get response string
        $sr = New-Object System.IO.StreamReader($stream)

			$strResponse = $sr.ReadToEnd()
            
		$sr.Close()
		$sr.Dispose()
        
        $stream.Close()
		
        $inputMatches = $strResponse | Select-String -AllMatches -Pattern "<input.+?\/??>" | select -Expand Matches
		
		$inputs = @{}
		
		# Look for inputs and add them to the dictionary for postback values
        foreach ($match in $inputMatches)
        {
			if (-not($match[0] -imatch "name=\""(.+?)\"""))
			{
				continue
			}
			$name = $matches[1]
			
			if(-not($match[0] -imatch "value=\""(.+?)\"""))
			{
				continue
			}
			$value = $matches[1]

            $inputs.Add($name, $value)
        }

        # Lookup for activate button's id
        $searchString = ""
		if ($activate) 
		{
			$searchString = "ActivateSolutionItem"
		}
		else
		{
			$searchString = "DeactivateSolutionItem"
		}
        
		$match = $strResponse -imatch "__doPostBack\(\&\#39\;(.*?$searchString)\&\#39\;"
		$inputs.Add("__EVENTTARGET", $Matches[1])
	
	$response.Close()
	$response.Dispose()
	
	# Format inputs as postback data string, but ignore the one that ends with iidIOGoBack
    $strPost = ""
    foreach ($inputKey in $inputs.Keys)
	{
        if (-not([String]::IsNullOrEmpty($inputKey)) -and -not($inputKey.EndsWith("iidIOGoBack")))
		{
            $strPost += [System.Uri]::EscapeDataString($inputKey) + "=" + [System.Uri]::EscapeDataString($inputs[$inputKey]) + "&"
		}
	}
	$strPost = $strPost.TrimEnd("&")
	
    $postData = [System.Text.Encoding]::UTF8.GetBytes($strPost);

    # Build postback request
    $activateRequest = $Spps.WebRequestExecutorFactory.CreateWebRequestExecutor($Spps, $solutionPageUrl).WebRequest
    $activateRequest.Method = "POST"
    $activateRequest.Accept = "text/html, application/xhtml+xml, */*"
    if ($Spps.Credentials -ne $null)
	{
		$activateRequest.CookieContainer = $cookieContainer
	}
	else
	{
		# No specific authentication required
		$activateRequest.UseDefaultCredentials = $true
	}
    $activateRequest.ContentType = "application/x-www-form-urlencoded"
    $activateRequest.ContentLength = $postData.Length
    $activateRequest.UserAgent = "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)";
    $activateRequest.Headers["Cache-Control"] = "no-cache";
    $activateRequest.Headers["Accept-Encoding"] = "gzip, deflate";
    $activateRequest.Headers["Accept-Language"] = "fr-FR,en-US";

    # Add postback data to the request stream
    $stream = $activateRequest.GetRequestStream()
        $stream.Write($postData, 0, $postData.Length)
        $stream.Close();
	$stream.Dispose()
	
    # Perform the postback
    $response = $activateRequest.GetResponse()
	$response.Close()
	$response.Dispose()
	
}

function Install-Solution
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$solutionName
	)
	
	Write-Host "Activate solution $path" -foregroundcolor black -backgroundcolor yellow
	
	Switch-EnableDisableSolution -solutionName $solutionName -activate $true
	
	Write-Host "Solution succesfully activated" -foregroundcolor black -backgroundcolor green
}

function Uninstall-Solution
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$solutionName
	)
	
	Write-Host "Deactivate solution $path" -foregroundcolor black -backgroundcolor yellow
	
	Switch-EnableDisableSolution -solutionName $solutionName -activate $false
	
	Write-Host "Solution succesfully deactivated" -foregroundcolor black -backgroundcolor green
}