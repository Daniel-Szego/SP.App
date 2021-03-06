#----------------------------------------------------------------------------- 
# Filename : spps.global.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Contains global helper methods

function Request-YesOrNo
{
    [CmdletBinding()]
    param
    (
        [Parameter(Mandatory=$false, Position=1)]
        [string]$title="Confirm",
        
        [Parameter(Mandatory=$true, Position=2)]
        [string]$message="Are you sure?"
    )

	$choiceYes = New-Object System.Management.Automation.Host.ChoiceDescription "&Yes", "Answer Yes."
	$choiceNo = New-Object System.Management.Automation.Host.ChoiceDescription "&No", "Answer No."
	$options = [System.Management.Automation.Host.ChoiceDescription[]]($choiceYes, $choiceNo)

	try {
		$result = $host.ui.PromptForChoice($title, $message, $options, 1)
	}
	catch [Management.Automation.Host.PromptingException] {
	    $result = $choiceNo
	}	

	switch ($result)
	{
		0 
		{
		    Return $true
		} 
		1 
		{
            Return $false
		}
	}
}

function Join-Parts
{
	[CmdletBinding()]
    param
    (
		[Parameter(Mandatory=$false, Position=1)]
        $Parts = $null,
		
		[Parameter(Mandatory=$false, Position=2)]
        $Separator = ''
    )

    $returnValue = (($Parts | ? { $_ } | % { ([string]$_).trim($Separator) } | ? { $_ } ) -join $Separator)

    if (-not ($returnValue.StartsWith("http", "CurrentCultureIgnoreCase")))
    {
        # is a relative path so add the seperator in front
        $returnValue = $Separator + $returnValue
    }

    return $returnValue
}

function Convert-FileVariablesToValues
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[System.IO.FileSystemInfo]$file
	)

	$filePath = $file.FullName
	$tempFilePath = "$filePath.temp"
	
	Write-Host "Replacing variables at $filePath" -foregroundcolor black -backgroundcolor yellow
    	
	$serverRelativeUrl = $spps.Site.ServerRelativeUrl
	if ($serverRelativeUrl -eq "/") {
		$serverRelativeUrl = ""
	}
	
	(get-content $filePath) | foreach-object {$_ -replace "~SiteCollection", $serverRelativeUrl } | set-content $tempFilePath
    
	return Get-Item -Path $tempFilePath
}

function Convert-StringVariablesToValues
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
		[String]$string
	)
	
	Write-Host "Replacing variables string variables" -foregroundcolor black -backgroundcolor yellow
	
	$serverRelativeUrl = $spps.Site.ServerRelativeUrl
	if ($serverRelativeUrl -eq "/") {
		$serverRelativeUrl = ""
	}
	
	$returnString = $string -replace "~SiteCollection", $serverRelativeUrl
    
	return $returnString
}